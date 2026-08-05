import { redirect } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { project, projectTask, projectModule, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { TasksBoardClient } from "./components/TasksBoardClient";

export default async function TasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;

  // Authenticate user
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if project exists
  const proj = await db.query.project.findFirst({
    where: eq(project.id, projectId),
    columns: { id: true },
  });

  if (!proj) {
    redirect("/projects");
  }

  // Fetch all tasks with their modules and assignees
  const rawTasks = await db
    .select({
      id: projectTask.id,
      name: projectTask.name,
      status: projectTask.status,
      effortHours: projectTask.effortHours,
      dueDate: projectTask.updatedAt, // Using updatedAt as a placeholder for dueDate since it's not in schema yet. Oh wait, it isn't in schema! I'll just use null if not in schema.
      aiRationale: projectTask.aiRationale,
      moduleName: projectModule.name,
      assigneeName: user.name,
      assigneeImage: user.image,
    })
    .from(projectTask)
    .innerJoin(projectModule, eq(projectTask.moduleId, projectModule.id))
    .leftJoin(user, eq(projectTask.assigneeId, user.id))
    .where(eq(projectTask.projectId, projectId))
    .orderBy(asc(projectTask.order));

  // The schema doesn't actually have a `dueDate` for tasks. I will map it to null for now.
  const mappedTasks = rawTasks.map(t => ({
    ...t,
    dueDate: null
  }));

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and track project tasks across modules.
        </p>
      </div>

      <TasksBoardClient projectId={projectId} initialTasks={mappedTasks} />
    </div>
  );
}
