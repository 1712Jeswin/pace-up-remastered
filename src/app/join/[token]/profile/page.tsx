import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq, and, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { project, projectInvite, projectMember, userProfile } from "@/db/schema";
import { JoinProjectShell } from "@/components/join/JoinProjectShell";

export const metadata = {
  title: "Join Project | Paceup",
};

export default async function JoinProfilePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // 1. Auth Guard
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect(`/login?returnTo=/join/${encodeURIComponent(token)}/profile`);
  }
  const userId = session.user.id;

  // 2. Resolve the invite token
  const [inviteRecord] = await db
    .select({
      id: projectInvite.id,
      status: projectInvite.status,
      expiresAt: projectInvite.expiresAt,
      inviteeId: projectInvite.inviteeId,
      projectId: project.id,
      title: project.title,
      type: project.type,
      deadline: project.deadline,
    })
    .from(projectInvite)
    .innerJoin(project, eq(projectInvite.projectId, project.id))
    .where(eq(projectInvite.token, token))
    .limit(1);

  if (!inviteRecord) {
    redirect(`/join/${encodeURIComponent(token)}?error=invalid`);
  }

  // 3. Validation
  if (inviteRecord.status !== "pending") {
    redirect(`/join/${encodeURIComponent(token)}?error=used`);
  }
  if (new Date() > inviteRecord.expiresAt) {
    redirect(`/join/${encodeURIComponent(token)}?error=expired`);
  }
  if (inviteRecord.inviteeId !== null && inviteRecord.inviteeId !== userId) {
    redirect(`/join/${encodeURIComponent(token)}?error=wrong_account`);
  }

  // 4. Get project member count
  const [memberCountResult] = await db
    .select({ value: count() })
    .from(projectMember)
    .where(eq(projectMember.projectId, inviteRecord.projectId));
  
  const memberCount = memberCountResult?.value ?? 0;

  // 5. Fetch user's global profile for initial skills pre-fill
  const [profile] = await db
    .select({ skills: userProfile.skills })
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .limit(1);

  return (
    <JoinProjectShell
      projectId={inviteRecord.projectId}
      inviteToken={token}
      project={{
        title: inviteRecord.title,
        memberCount,
        deadline: inviteRecord.deadline ? inviteRecord.deadline.toISOString() : null,
      }}
      initialGlobalSkills={profile?.skills ?? []}
    />
  );
}
