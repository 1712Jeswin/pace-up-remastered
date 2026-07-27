import { NextRequest, NextResponse } from "next/server";
import { suggestHandleFromName, suggestHandleFromGitHub } from "@/lib/handle";

export const dynamic = "force-dynamic";

/**
 * GET /api/handle/suggest?name=Display+Name
 * GET /api/handle/suggest?github=username
 *
 * Suggests an available handle from a display name or GitHub username.
 * The GitHub path takes priority if both are provided.
 *
 * Response shape: { success: boolean, suggested: string }
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const github = searchParams.get("github")?.trim();
  const name = searchParams.get("name")?.trim();

  if (!github && !name) {
    return NextResponse.json(
      { success: false, error: "Provide either a 'name' or 'github' parameter." },
      { status: 400 }
    );
  }

  try {
    // GitHub username takes priority when available (aligns with dev-focused user base)
    const suggested = github
      ? await suggestHandleFromGitHub(github)
      : await suggestHandleFromName(name!);

    return NextResponse.json({ success: true, suggested }, { status: 200 });
  } catch (error) {
    console.error("[handle/suggest] Generation failed:", error);
    return NextResponse.json(
      { success: false, error: "Could not generate a handle suggestion. Please try again." },
      { status: 500 }
    );
  }
}
