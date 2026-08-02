// Server-only Supabase client using the service-role key.
// IMPORTANT: Never import this in any Client Component — it would expose the
// service-role key to the browser. Use only in Server Components, Server Actions,
// and API routes.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  // Warn at module load time so the issue surfaces clearly in server logs.
  // Do not throw — the module still loads, but every call will fail gracefully.
  console.warn(
    "[supabase-server] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set."
  );
}

/**
 * Service-role Supabase client.
 * Bypasses Row Level Security — only call after performing your own auth/authz checks.
 */
export const supabaseAdmin = createClient(
  supabaseUrl ?? "",
  serviceRoleKey ?? "",
  {
    auth: {
      // Prevents the SDK from persisting session data server-side
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
