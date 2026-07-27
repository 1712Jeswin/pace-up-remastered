import { NextRequest, NextResponse } from "next/server";

// TODO: Phase 4 — replace this placeholder with real DB lookup once the
// handle column and uniqueness constraint are added to the user schema.
const MOCK_TAKEN_HANDLES = new Set([
  "admin",
  "paceup",
  "support",
  "jeswin",
  "test",
  "user",
]);

const HANDLE_REGEX = /^[a-z0-9_]{3,24}$/;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle")?.toLowerCase().trim();

  if (!handle) {
    return NextResponse.json(
      { success: false, error: "Missing handle parameter" },
      { status: 400 }
    );
  }

  if (!HANDLE_REGEX.test(handle)) {
    return NextResponse.json(
      {
        success: true,
        available: false,
        reason: "Handle must be 3-24 characters: lowercase letters, numbers, and underscores only.",
      },
      { status: 200 }
    );
  }

  const isAvailable = !MOCK_TAKEN_HANDLES.has(handle);

  return NextResponse.json(
    { success: true, available: isAvailable },
    { status: 200 }
  );
}
