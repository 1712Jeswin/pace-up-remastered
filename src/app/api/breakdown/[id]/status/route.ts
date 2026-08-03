import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { breakdownJob, projectMember } from "@/db/schema";

// ─── GET /api/breakdown/[id]/status ──────────────────────────────────────────

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  // Auth guard — session-derived identity only
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const userId = session.user.id;

  // Authorisation — confirm the requesting user is a member of this project
  // Row-level check: never return breakdown data to non-members
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
    return NextResponse.json({ error: "Not a member of this project." }, { status: 403 });
  }

  // Fetch job status
  const [job] = await db
    .select({
      status: breakdownJob.status,
      errorMessage: breakdownJob.errorMessage,
    })
    .from(breakdownJob)
    .where(eq(breakdownJob.projectId, projectId))
    .limit(1);

  if (!job) {
    return NextResponse.json({ status: "pending" });
  }

  return NextResponse.json({
    status: job.status,
    // Only include errorMessage when status is "failed"
    ...(job.status === "failed" && { errorMessage: job.errorMessage }),
  });
}
