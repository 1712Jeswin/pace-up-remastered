import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { breakdownJob, projectMember, project } from "@/db/schema";
import { BreakdownPollingShell } from "./BreakdownPollingShell";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: "Building your breakdown... | Paceup",
  };
}

export default async function BreakdownPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;

  // ── Auth guard ──────────────────────────────────────────────────────────────
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect(`/login?returnTo=/projects/${projectId}/breakdown`);
  }
  const userId = session.user.id;

  // ── Membership check ───────────────────────────────────────────────────────
  // Row-level: only members of this project can view the breakdown
  const [membership] = await db
    .select({ id: projectMember.id })
    .from(projectMember)
    .where(
      and(
        eq(projectMember.projectId, projectId),
        eq(projectMember.userId, userId)
      )
    )
    .limit(1);

  if (!membership) {
    redirect("/projects");
  }

  // ── Fetch breakdown job status ─────────────────────────────────────────────
  const [job] = await db
    .select({ status: breakdownJob.status })
    .from(breakdownJob)
    .where(eq(breakdownJob.projectId, projectId))
    .limit(1);

  const status = job?.status ?? "pending";

  // ── If already complete, redirect straight to the review screen ────────────
  // Phase 23 builds the review page at /projects/[id]/breakdown/review.
  // For now, redirect to the project root as a placeholder.
  if (status === "complete") {
    redirect(`/projects/${projectId}/breakdown/review`);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header with project context */}
      <header className="border-b border-border/40 px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-toxic animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">
              Paceup AI is working...
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            You can close this tab — we&apos;ll finish in the background.
          </span>
        </div>
      </header>

      {/* Polling shell handles the loading → complete → error states */}
      <BreakdownPollingShell
        projectId={projectId}
        initialStatus={status}
      />
    </div>
  );
}
