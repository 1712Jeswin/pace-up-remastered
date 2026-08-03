import { task, logger } from "@trigger.dev/sdk/v3";
import { generateObject } from "ai";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { decryptApiKey } from "@/lib/encryption";
import { getAiModel, type AiProviderName } from "@/lib/ai-provider";
import {
  project,
  projectMember,
  projectApiKey,
  breakdownJob,
  projectModule,
  projectMilestone,
  projectTask,
  user,
} from "@/db/schema";
import { nanoid } from "nanoid";

// ─── Zod output schema ────────────────────────────────────────────────────────

const TaskSchema = z.object({
  name: z.string().max(200).describe("Short, action-oriented task name (e.g. 'Build login API route')"),
  description: z.string().describe("2-3 sentence description of what this task involves"),
  effortHours: z.number().int().min(1).max(40).describe("Realistic effort estimate in hours"),
  assigneeMemberId: z.string().nullable().describe("The project member ID to assign this task to, or null if unassignable"),
  aiRationale: z.string().describe("1-2 sentence natural-language explanation of why this member was chosen, referencing their specific skills or experience"),
  lowConfidence: z.boolean().describe("Set to true if the assignee profile is too incomplete to confidently assign"),
  lowConfidenceNote: z.string().nullable().describe("If lowConfidence is true, briefly explain why"),
});

const ModuleSchema = z.object({
  name: z.string().max(120).describe("Short module name (e.g. 'Authentication', 'Data Pipeline')"),
  description: z.string().describe("1-2 sentence description of this module's scope"),
  tasks: z.array(TaskSchema).min(1).max(12),
});

const MilestoneSchema = z.object({
  name: z.string().max(120).describe("Milestone name (e.g. 'Core backend complete')"),
  description: z.string().describe("1-2 sentence description of what should be done by this milestone"),
  // ISO 8601 date string — we parse it to a Date before storing
  dueDate: z.string().describe("Target date for this milestone in YYYY-MM-DD format"),
});

const BreakdownSchema = z.object({
  modules: z.array(ModuleSchema).min(1).max(8),
  milestones: z.array(MilestoneSchema).min(1).max(6),
});

// ─── Task input type ──────────────────────────────────────────────────────────

interface BreakdownPayload {
  projectId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds the structured prompt for the AI model.
 * All project context is injected here — the model never has access to raw DB rows.
 */
function buildPrompt(
  projectData: {
    title: string;
    type: string;
    deadline: Date | null;
    problemStatement: string | null;
  },
  members: {
    id: string;
    name: string;
    rolePreference: string | null;
    skills: { name: string; confidence: "Comfortable" | "Learning" }[] | null;
    weeklyHours: number | null;
    resumeSummary: string | null;
    otherProjects: boolean | null;
  }[]
): string {
  const deadlineStr = projectData.deadline
    ? projectData.deadline.toISOString().split("T")[0]
    : "no deadline specified";

  const today = new Date().toISOString().split("T")[0];

  const memberProfiles = members
    .map((m) => {
      const skillList =
        m.skills && m.skills.length > 0
          ? m.skills
              .map((s) => `${s.name} (${s.confidence})`)
              .join(", ")
          : "No skills listed";

      const lines = [
        `  Member ID: ${m.id}`,
        `  Name: ${m.name}`,
        `  Preferred Role: ${m.rolePreference ?? "Flexible"}`,
        `  Skills: ${skillList}`,
        `  Weekly Hours Available: ${m.weeklyHours ?? "Unknown"}`,
        `  Working on Another Project: ${m.otherProjects ? "Yes" : "No"}`,
      ];

      if (m.resumeSummary) {
        lines.push(`  Background Summary: ${m.resumeSummary}`);
      }

      return lines.join("\n");
    })
    .join("\n\n");

  return `You are the Paceup AI Project Breakdown Engine. Your job is to produce a structured, realistic breakdown of a software project into modules, milestones, and tasks, with task assignments matched to team members' skills and availability.

== PROJECT CONTEXT ==
Title: ${projectData.title}
Type: ${projectData.type}
Deadline: ${deadlineStr}
Today's Date: ${today}
Problem Statement: ${projectData.problemStatement ?? "Not provided"}

== TEAM MEMBERS ==
${memberProfiles}

== INSTRUCTIONS ==
1. Identify 2-8 logical modules that cover the project's full scope.
2. Plan 2-6 milestones spread across the time between today and the deadline.
3. Under each module, define specific tasks (1-12 per module).
4. For each task, suggest the most suitable team member based on their skills, role preference, and availability. Reference their specific skills or experience in the rationale.
5. If a member's profile is too incomplete to assign confidently, set lowConfidence: true and explain why.
6. Be realistic about effort — don't underestimate. A typical task is 2-8 hours.
7. Spread work reasonably across team members based on their weekly hours.
8. Use the exact Member IDs provided above in assigneeMemberId — do NOT invent IDs.

Return valid JSON matching the provided schema. Do not add any markdown or extra commentary.`;
}

// ─── Main Task ────────────────────────────────────────────────────────────────

export const aiBreakdownEngine = task({
  id: "ai-breakdown-engine",
  maxDuration: 120, // 2 minutes max — generous for slow providers
  retry: {
    maxAttempts: 1, // Trigger.dev-level retry; we handle AI retry internally
  },

  run: async (payload: BreakdownPayload) => {
    const { projectId } = payload;

    logger.info("AI Breakdown Engine started", { projectId });

    // ── Step 1: Mark job as running ──────────────────────────────────────────
    await db
      .update(breakdownJob)
      .set({ status: "running", startedAt: new Date() })
      .where(eq(breakdownJob.projectId, projectId));

    try {
      // ── Step 2: Fetch project data ─────────────────────────────────────────
      const [projectData] = await db
        .select({
          id: project.id,
          title: project.title,
          type: project.type,
          deadline: project.deadline,
          ownerId: project.ownerId,
        })
        .from(project)
        .where(eq(project.id, projectId))
        .limit(1);

      if (!projectData) {
        throw new Error(`Project ${projectId} not found.`);
      }

      // ── Step 3: Fetch all members with their profiles ──────────────────────
      // We use the project_member row for project-specific skills/role/resume
      // and join to the user table for the member's display name.
      // Index used: project_member_project_idx
      const members = await db
        .select({
          id: projectMember.id,
          userId: projectMember.userId,
          name: user.name,
          rolePreference: projectMember.rolePreference,
          skills: projectMember.skills,
          weeklyHours: projectMember.weeklyHours,
          resumeSummary: projectMember.resumeSummary,
          otherProjects: projectMember.otherProjects,
        })
        .from(projectMember)
        .innerJoin(user, eq(projectMember.userId, user.id))
        .where(eq(projectMember.projectId, projectId));

      if (members.length === 0) {
        throw new Error(`No members found for project ${projectId}.`);
      }

      logger.info("Fetched project data and members", {
        projectId,
        memberCount: members.length,
      });

      // ── Step 4: Fetch and decrypt the AI provider key ──────────────────────
      // Policy: use the owner's key. For "per_member_key" projects this would
      // need per-user resolution, handled in a future phase.
      const [apiKeyRecord] = await db
        .select({
          encryptedKey: projectApiKey.encryptedKey,
          provider: projectApiKey.provider,
        })
        .from(projectApiKey)
        .where(
          and(
            eq(projectApiKey.projectId, projectId),
            eq(projectApiKey.userId, projectData.ownerId)
          )
        )
        .limit(1);

      if (!apiKeyRecord) {
        throw new Error(
          `No API key found for project ${projectId}. Cannot run AI breakdown.`
        );
      }

      // Decrypt server-side — plaintext key never leaves this function scope
      const plaintextKey = decryptApiKey(apiKeyRecord.encryptedKey);
      const model = getAiModel(apiKeyRecord.provider as AiProviderName, plaintextKey);

      logger.info("AI provider resolved", { provider: apiKeyRecord.provider });

      // ── Step 5: Build prompt and call AI ──────────────────────────────────
      const prompt = buildPrompt(
        {
          title: projectData.title,
          type: projectData.type,
          deadline: projectData.deadline ?? null,
          problemStatement: null, // TODO: add to schema in a future phase
        },
        members.map((m) => ({
          id: m.id,
          name: m.name,
          rolePreference: m.rolePreference ?? null,
          skills: m.skills ?? null,
          weeklyHours: m.weeklyHours ?? null,
          resumeSummary: m.resumeSummary ?? null,
          otherProjects: m.otherProjects ?? false,
        }))
      );

      let breakdown: z.infer<typeof BreakdownSchema>;

      try {
        const result = await generateObject({
          model,
          schema: BreakdownSchema,
          prompt,
          temperature: 0.4, // Low temperature for structured, consistent output
        });
        breakdown = result.object;
        logger.info("AI generation successful (first attempt)");
      } catch (firstErr) {
        // ── Corrective retry ─────────────────────────────────────────────────
        logger.warn("First AI attempt failed, retrying with corrective prompt", {
          error: firstErr instanceof Error ? firstErr.message : String(firstErr),
        });

        const correctivePrompt = `${prompt}

IMPORTANT: Your previous response did not match the required schema. Please ensure:
- All assigneeMemberId values are exact Member IDs from the list above (or null).
- All dueDate values are in YYYY-MM-DD format.
- The response is pure JSON with no markdown or commentary.
- effortHours is an integer between 1 and 40.

Try again and return only the JSON object.`;

        const retryResult = await generateObject({
          model,
          schema: BreakdownSchema,
          prompt: correctivePrompt,
          temperature: 0.2,
        });
        breakdown = retryResult.object;
        logger.info("AI generation successful (corrective retry)");
      }

      // ── Step 6: Persist breakdown to DB ──────────────────────────────────
      // Build all insert queries first, then fire them in one batch.
      // This is the closest approximation to atomic we can achieve with neon-http.
      const now = new Date();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- batch typing requires any[]
      const batchWrites: any[] = [];

      // Map module index → generated ID (used when inserting tasks)
      const moduleIds: string[] = [];

      for (let mIdx = 0; mIdx < breakdown.modules.length; mIdx++) {
        const mod = breakdown.modules[mIdx];
        const moduleId = nanoid();
        moduleIds.push(moduleId);

        batchWrites.push(
          db.insert(projectModule).values({
            id: moduleId,
            projectId,
            name: mod.name,
            description: mod.description,
            order: mIdx,
            createdAt: now,
          })
        );

        for (let tIdx = 0; tIdx < mod.tasks.length; tIdx++) {
          const taskItem = mod.tasks[tIdx];
          const taskId = nanoid();

          // Validate that the assigneeMemberId actually exists in our members list.
          // The AI sometimes hallucinates IDs — never trust without verifying.
          const isValidAssignee =
            taskItem.assigneeMemberId !== null &&
            members.some((m) => m.id === taskItem.assigneeMemberId);

          batchWrites.push(
            db.insert(projectTask).values({
              id: taskId,
              projectId,
              moduleId,
              name: taskItem.name,
              description: taskItem.description,
              effortHours: taskItem.effortHours,
              assigneeId: isValidAssignee
                ? members.find((m) => m.id === taskItem.assigneeMemberId)!.userId
                : null,
              aiRationale: taskItem.aiRationale,
              lowConfidence: taskItem.lowConfidence || !isValidAssignee,
              lowConfidenceNote:
                !isValidAssignee && !taskItem.lowConfidence
                  ? "AI returned an unrecognised member ID — task left unassigned."
                  : (taskItem.lowConfidenceNote ?? null),
              humanOverride: false,
              status: "not_started",
              order: tIdx,
              createdAt: now,
              updatedAt: now,
            })
          );
        }
      }

      for (let msIdx = 0; msIdx < breakdown.milestones.length; msIdx++) {
        const ms = breakdown.milestones[msIdx];
        const milestoneId = nanoid();

        // Parse the AI's date string safely
        const dueDate = new Date(ms.dueDate);
        if (isNaN(dueDate.getTime())) {
          logger.warn("AI returned invalid milestone date, using deadline", {
            raw: ms.dueDate,
          });
          // Fall back to the project deadline or today + 7 days
          const fallback = projectData.deadline ?? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          batchWrites.push(
            db.insert(projectMilestone).values({
              id: milestoneId,
              projectId,
              name: ms.name,
              description: ms.description,
              dueDate: fallback,
              completed: false,
              order: msIdx,
              createdAt: now,
            })
          );
        } else {
          batchWrites.push(
            db.insert(projectMilestone).values({
              id: milestoneId,
              projectId,
              name: ms.name,
              description: ms.description,
              dueDate,
              completed: false,
              order: msIdx,
              createdAt: now,
            })
          );
        }
      }

      if (batchWrites.length === 0) {
        throw new Error("Breakdown generated no content to write.");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- BatchItem<"pg"> generic is too strict for a dynamically built array
      await db.batch(batchWrites as any);

      logger.info("Breakdown persisted to DB", {
        moduleCount: breakdown.modules.length,
        milestoneCount: breakdown.milestones.length,
        taskCount: batchWrites.length - breakdown.modules.length - breakdown.milestones.length,
      });

      // ── Step 7: Mark job as complete ──────────────────────────────────────
      await db
        .update(breakdownJob)
        .set({ status: "complete", completedAt: now })
        .where(eq(breakdownJob.projectId, projectId));

      logger.info("AI Breakdown Engine completed successfully", { projectId });

      return { success: true, projectId };
    } catch (err) {
      // ── Error handler: mark job as failed ─────────────────────────────────
      // Never expose raw error objects to the client — only sanitised message to DB.
      const message =
        err instanceof Error ? err.message : "Unknown error during breakdown generation.";

      logger.error("AI Breakdown Engine failed", { projectId, error: message });

      await db
        .update(breakdownJob)
        .set({
          status: "failed",
          errorMessage: message.slice(0, 500), // Guard against absurdly long messages
          completedAt: new Date(),
        })
        .where(eq(breakdownJob.projectId, projectId));

      // Re-throw so Trigger.dev records the failure in its dashboard
      throw err;
    }
  },
});
