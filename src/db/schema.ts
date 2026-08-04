import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
  index,
  uniqueIndex,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Enable pgvector extension when migrating if needed:
// CREATE EXTENSION IF NOT EXISTS vector;

// Better Auth required tables + Paceup custom fields (handle)
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  handle: varchar("handle", { length: 30 }).unique(),
}, (table) => [
  // Case-insensitive uniqueness — prevents "Jeswin" and "jeswin" from coexisting.
  // Handle lookups use LOWER() to match against this index.
  uniqueIndex("user_handle_lower_idx").on(sql`LOWER(${table.handle})`),
]);

// ─── Global User Profile ──────────────────────────────────────────────────────

export const userProfile = pgTable("user_profile", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  // Global skillset default for the user
  skills: jsonb("skills").$type<{ name: string; confidence: "Comfortable" | "Learning" }[]>(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

// ─── Project enums ────────────────────────────────────────────────────────────

export const projectTypeEnum = pgEnum("project_type", [
  "Hackathon",
  "Final-Year Project",
  "Coursework",
  "Club Project",
  "Research",
]);

export const projectRoleEnum = pgEnum("project_role", ["owner", "member"]);

export const projectRolePreferenceEnum = pgEnum("project_role_preference", [
  "Frontend",
  "Backend",
  "Design",
  "Research",
  "PM-ish",
  "Flexible",
]);

// ─── Project ─────────────────────────────────────────────────────────────────

export const project = pgTable(
  "project",
  {
    id: text("id").primaryKey(),
    title: varchar("title", { length: 120 }).notNull(),
    type: projectTypeEnum("type").notNull(),
    // 0-100 integer representing task completion percentage
    progress: integer("progress").notNull().default(0),
    deadline: timestamp("deadline"),
    // Soft-archive: not deleted, hidden from the active grid
    archivedAt: timestamp("archivedAt"),
    lastActiveAt: timestamp("lastActiveAt").notNull(),
    ownerId: text("ownerId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => [
    // "All projects where ownerId = X" - used by the owned-by-me filter
    index("project_owner_idx").on(table.ownerId),
    // Default sort: recently active
    index("project_last_active_idx").on(table.lastActiveAt),
    // Archived filter
    index("project_archived_idx").on(table.archivedAt),
  ]
);

// ─── Project Member ───────────────────────────────────────────────────────────

export const projectMember = pgTable(
  "project_member",
  {
    id: text("id").primaryKey(),
    projectId: text("projectId")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: projectRoleEnum("role").notNull().default("member"),
    
    // Project-specific profile setup
    skills: jsonb("skills").$type<{ name: string; confidence: "Comfortable" | "Learning" }[]>(),
    rolePreference: projectRolePreferenceEnum("rolePreference"),
    interests: text("interests"),
    weeklyHours: integer("weeklyHours"),
    otherProjects: boolean("otherProjects").default(false),
    timezone: text("timezone"),

    // Phase 21: Resume upload & AI parsing
    // The AI-generated (and user-editable) experience summary extracted from the resume.
    resumeSummary: text("resumeSummary"),
    // Supabase Storage path for the uploaded resume file — retained for reference or cleanup.
    resumeStoragePath: text("resumeStoragePath"),

    joinedAt: timestamp("joinedAt").notNull(),
  },
  (table) => [
    // "All members of project X" - used for avatar clusters on the card
    index("project_member_project_idx").on(table.projectId),
    // "All projects user Y is in" - used by the hub member filter
    index("project_member_user_idx").on(table.userId),
    // A user can only appear once per project
    uniqueIndex("project_member_unique_idx").on(table.projectId, table.userId),
  ]
);

// ─── Project Invite ───────────────────────────────────────────────────────────

export const inviteStatusEnum = pgEnum("invite_status", [
  "pending",
  "accepted",
  "declined",
  "expired",
]);

export const projectInvite = pgTable(
  "project_invite",
  {
    id: text("id").primaryKey(),
    projectId: text("projectId")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    // Invited user - null if link-based invite not yet claimed
    inviteeId: text("inviteeId").references(() => user.id, { onDelete: "set null" }),
    invitedByUserId: text("invitedByUserId")
      .notNull()
      .references(() => user.id),
    // Short code for manual entry; token for link-based invites
    code: varchar("code", { length: 16 }).unique(),
    token: text("token").unique(),
    status: inviteStatusEnum("status").notNull().default("pending"),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => [
    // Pending invites for a given user - shown in hub banner
    index("project_invite_invitee_idx").on(table.inviteeId),
    index("project_invite_project_idx").on(table.projectId),
  ]
);

// ─── AI Provider Key ──────────────────────────────────────────────────────────

export const aiProviderEnum = pgEnum("ai_provider", [
  "gemini",
  "openai",
  "anthropic",
  "openrouter",
  "groq",
]);

export const keyPolicyEnum = pgEnum("key_policy", [
  // The project owner's key is used for all AI calls in this project
  "owner_key",
  // Each member must connect their own key
  "per_member_key",
]);

/**
 * Stores an encrypted AI provider API key for a user+project combination.
 * The key is AES-256-GCM envelope-encrypted server-side and NEVER returned
 * to the client in plaintext. Once saved, the UI shows only "Key saved ✓".
 *
 * Policy: either the owner's key is shared (owner_key) or each member
 * must supply their own (per_member_key). Stored per (projectId, userId).
 */
export const projectApiKey = pgTable(
  "project_api_key",
  {
    id: text("id").primaryKey(),
    projectId: text("projectId")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    provider: aiProviderEnum("provider").notNull(),
    // Envelope-encrypted ciphertext: iv:authTag:encDataKey:iv2:authTag2:ciphertext (hex, colon-delimited)
    encryptedKey: text("encryptedKey").notNull(),
    policy: keyPolicyEnum("policy").notNull().default("owner_key"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => [
    // One key per user per project per provider
    uniqueIndex("project_api_key_unique_idx").on(table.projectId, table.userId, table.provider),
    // "All keys for project X" — used when determining which members have connected
    index("project_api_key_project_idx").on(table.projectId),
  ]
);
// ─── AI Breakdown Engine (Phase 22) ─────────────────────────────────────────

export const breakdownStatusEnum = pgEnum("breakdown_status", [
  "pending",
  "running",
  "complete",
  "failed",
]);

/**
 * One row per project. Tracks the lifecycle of the AI Breakdown Engine job.
 * The `triggerRunId` is used to look up live status in the Trigger.dev dashboard.
 */
export const breakdownJob = pgTable(
  "breakdown_job",
  {
    id: text("id").primaryKey(),
    projectId: text("projectId")
      .notNull()
      .unique()
      .references(() => project.id, { onDelete: "cascade" }),
    status: breakdownStatusEnum("status").notNull().default("pending"),
    // Trigger.dev run ID — stored so we can deep-link into the dashboard for debugging
    triggerRunId: text("triggerRunId"),
    // Plain-text error message if status = "failed" — never a raw stack trace
    errorMessage: text("errorMessage"),
    // Optional user-supplied feedback note for regeneration ("What should be different?")
    feedbackNote: text("feedbackNote"),
    startedAt: timestamp("startedAt"),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => [
    index("breakdown_job_project_idx").on(table.projectId),
    index("breakdown_job_status_idx").on(table.status),
  ]
);

/**
 * A logical grouping of tasks within a project (e.g., "Auth & User Accounts").
 * Generated by the AI Breakdown Engine.
 */
export const projectModule = pgTable(
  "project_module",
  {
    id: text("id").primaryKey(),
    projectId: text("projectId")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    // Display order — lower is first
    order: integer("order").notNull().default(0),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => [
    index("project_module_project_idx").on(table.projectId),
  ]
);

/**
 * A date-anchored checkpoint on the project timeline.
 * Generated by the AI Breakdown Engine.
 */
export const projectMilestone = pgTable(
  "project_milestone",
  {
    id: text("id").primaryKey(),
    projectId: text("projectId")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    dueDate: timestamp("dueDate").notNull(),
    // completed is set to true by users later (Phase 27)
    completed: boolean("completed").notNull().default(false),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => [
    index("project_milestone_project_idx").on(table.projectId),
  ]
);

/**
 * An individual unit of work within a module.
 * Generated by the AI Breakdown Engine, editable in Phase 24.
 */
export const projectTask = pgTable(
  "project_task",
  {
    id: text("id").primaryKey(),
    projectId: text("projectId")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    moduleId: text("moduleId")
      .notNull()
      .references(() => projectModule.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    // Effort in hours — AI estimate
    effortHours: integer("effortHours"),
    // Assigned project member — null means unassigned
    assigneeId: text("assigneeId").references(() => user.id, { onDelete: "set null" }),
    // AI-generated natural-language explanation of why this member was assigned
    aiRationale: text("aiRationale"),
    // true if the AI couldn't confidently assign (member profile incomplete etc.)
    lowConfidence: boolean("lowConfidence").notNull().default(false),
    // Note shown alongside lowConfidence tasks explaining why confidence is low
    lowConfidenceNote: text("lowConfidenceNote"),
    // Was this task manually edited/reassigned after AI generation? (Phase 24)
    humanOverride: boolean("humanOverride").notNull().default(false),
    // Task lifecycle: not_started → in_progress → complete → blocked
    status: text("status").notNull().default("not_started"),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => [
    index("project_task_project_idx").on(table.projectId),
    index("project_task_module_idx").on(table.moduleId),
    // "All tasks assigned to user X" — used by member workload view
    index("project_task_assignee_idx").on(table.assigneeId),
  ]
);
