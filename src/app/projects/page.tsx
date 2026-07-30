import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { project, projectMember, projectInvite, user } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { ProjectsHubClient } from "@/components/projects/ProjectsHubClient";
import type { ProjectCardData } from "@/types/project";

export const metadata: Metadata = {
  title: "Your Projects — Paceup",
  description: "View, sort, and manage all your Paceup projects.",
};

export default async function ProjectsPage() {
  // ── Auth guard ──────────────────────────────────────────────────────────────
  // Never trust a client-supplied user ID — derive identity from the server session.
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect("/login");
  }
  const currentUserId = session.user.id;

  let projectCards: ProjectCardData[] = [];
  let pendingInviteCount = 0;

  try {
    // ── Step 1: find all projects this user is a member of ──────────────────
    const memberships = await db
      .select({
        projectId: projectMember.projectId,
        role: projectMember.role,
      })
      .from(projectMember)
      .where(eq(projectMember.userId, currentUserId));

    if (memberships.length > 0) {
      const projectIds = memberships.map((m) => m.projectId);

      // ── Step 2: fetch those projects ──────────────────────────────────────
      // Index used: PRIMARY KEY (id)
      const allProjects = await db
        .select({
          id: project.id,
          title: project.title,
          type: project.type,
          progress: project.progress,
          deadline: project.deadline,
          archivedAt: project.archivedAt,
          lastActiveAt: project.lastActiveAt,
        })
        .from(project)
        .where(inArray(project.id, projectIds));

      // ── Step 3: fetch member avatars for all projects in one batch ────────
      // Index used: project_member_project_idx (projectId)
      const allMembers = await db
        .select({
          projectId: projectMember.projectId,
          userId: projectMember.userId,
          name: user.name,
          image: user.image,
        })
        .from(projectMember)
        .innerJoin(user, eq(projectMember.userId, user.id))
        .where(inArray(projectMember.projectId, projectIds));

      // Build role lookup: projectId -> role
      const roleMap = new Map(memberships.map((m) => [m.projectId, m.role]));

      // Build avatar map: projectId -> member[]
      const avatarMap = new Map<
        string,
        { id: string; name: string; image: string | null }[]
      >();
      for (const m of allMembers) {
        const list = avatarMap.get(m.projectId) ?? [];
        list.push({ id: m.userId, name: m.name, image: m.image });
        avatarMap.set(m.projectId, list);
      }

      projectCards = allProjects.map((p) => ({
        id: p.id,
        title: p.title,
        type: p.type,
        progress: p.progress,
        deadline: p.deadline,
        archivedAt: p.archivedAt,
        lastActiveAt: p.lastActiveAt,
        role: roleMap.get(p.id) ?? "member",
        memberAvatars: avatarMap.get(p.id) ?? [],
      }));
    }

    // ── Step 4: count pending invites for the banner ───────────────────────
    // Index used: project_invite_invitee_idx (inviteeId)
    const pendingInvites = await db
      .select({ id: projectInvite.id })
      .from(projectInvite)
      .where(
        and(
          eq(projectInvite.inviteeId, currentUserId),
          eq(projectInvite.status, "pending")
        )
      );
    pendingInviteCount = pendingInvites.length;
  } catch {
    // DB not yet migrated or connection error: render empty state gracefully.
    // Do not expose the raw error to the client.
    projectCards = [];
    pendingInviteCount = 0;
  }

  return (
    <ProjectsHubClient
      projects={projectCards}
      pendingInviteCount={pendingInviteCount}
    />
  );
}
