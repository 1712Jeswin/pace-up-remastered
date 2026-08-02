import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { project, projectMember, userProfile } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { JoinProjectShell } from "@/components/join/JoinProjectShell";

interface JoinPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function JoinProjectPage({ params }: JoinPageProps) {
  const { id } = await params;

  // 1. Authenticate user
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  const userId = session.user.id;

  // 2. Fetch project and member count
  const projectData = await db.query.project.findFirst({
    where: eq(project.id, id),
    with: {
      // In a real app we might just count them, but pulling all members is fine for small teams
    }
  });

  if (!projectData) {
    notFound();
  }

  // Count members efficiently using a raw SQL query if we wanted to, but for now we can just 
  // do a count query
  const memberCountResult = await db
    .select()
    .from(projectMember)
    .where(eq(projectMember.projectId, id));
    
  const memberCount = memberCountResult.length;

  // 3. Optional: check if user is ALREADY fully set up in this project (e.g. rolePreference is not null)
  // If they are already in the project AND rolePreference is set, they shouldn't be here.
  const existingMembership = await db.query.projectMember.findFirst({
    where: and(
      eq(projectMember.projectId, id),
      eq(projectMember.userId, userId)
    )
  });

  // For this flow, we assume they are either being added right now, or they are updating their profile.
  // We'll proceed to the shell.

  // 4. Fetch global profile to pre-fill skills
  const profile = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, userId),
  });

  // Drizzle type for JSONB is unknown, we cast it to our known type
  const initialGlobalSkills = profile?.skills
    ? (profile.skills as { name: string; confidence: "Comfortable" | "Learning" }[])
    : undefined;

  return (
    <JoinProjectShell
      projectId={id}
      project={{
        title: projectData.title,
        memberCount: memberCount || 1, // Fallback to 1 if we're the first
        deadline: projectData.deadline ? projectData.deadline.toISOString() : null,
      }}
      initialGlobalSkills={initialGlobalSkills}
    />
  );
}
