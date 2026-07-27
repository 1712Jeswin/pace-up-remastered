import { NextRequest, NextResponse } from "next/server";
import { checkHandleAvailability } from "@/lib/handle";

export const dynamic = "force-dynamic";

/**
 * GET /api/handle/check?handle=candidate
 *
 * Returns whether a handle is available for claiming.
 * Validates format, checks reserved words, then performs a case-insensitive DB lookup.
 *
 * Response shape: { success: boolean, available: boolean, reason?: string }
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const rawHandle = searchParams.get("handle");

  if (!rawHandle) {
    return NextResponse.json(
      { success: false, error: "Missing handle parameter" },
      { status: 400 }
    );
  }

  const handle = rawHandle.toLowerCase().trim();

  try {
    const result = await checkHandleAvailability(handle);
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    // Never expose raw error details to the client
    console.error("[handle/check] DB lookup failed:", error);
    return NextResponse.json(
      { success: false, error: "Could not check handle availability. Please try again." },
      { status: 500 }
    );
  }
}
