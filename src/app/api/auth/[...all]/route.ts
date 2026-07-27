import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Force dynamic — this route requires a live DB connection and must never be statically pre-rendered.
export const dynamic = "force-dynamic";

export const { GET, POST } = toNextJsHandler(auth.handler);
