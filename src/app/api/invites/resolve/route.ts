import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/invites/resolve?token=...
 *
 * Mock endpoint for Phase 6 to resolve an invite token or code into project details.
 * Returns a 404 if the token is invalid or expired.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Missing token parameter" },
      { status: 400 }
    );
  }

  // Simulate invalid tokens
  if (token === "expired" || token === "invalid") {
    return NextResponse.json(
      { success: false, error: "This invite link is invalid or has expired." },
      { status: 404 }
    );
  }

  // Mock valid payload
  const mockProject = {
    title: "Paceup Remastered V1",
    type: "Software Development",
    teamSize: 4,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
  };

  return NextResponse.json(
    { success: true, project: mockProject },
    { status: 200 }
  );
}
