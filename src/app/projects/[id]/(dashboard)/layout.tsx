import { redirect } from "next/navigation";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { project, projectMember } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;

  // Authenticate user
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  // Verify access and get project data
  const [proj] = await db
    .select({
      id: project.id,
      title: project.title,
      deadline: project.deadline,
      progress: project.progress,
    })
    .from(project)
    .leftJoin(projectMember, eq(project.id, projectMember.projectId))
    .where(
      and(
        eq(project.id, projectId),
        // Must be owner OR member
        sql`${project.ownerId} = ${userId} OR ${projectMember.userId} = ${userId}`
      )
    )
    .limit(1);

  if (!proj) {
    redirect("/projects");
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar projectId={projectId} />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <TopBar
          projectId={projectId}
          projectName={proj.title}
          deadline={proj.deadline}
          progress={proj.progress}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
