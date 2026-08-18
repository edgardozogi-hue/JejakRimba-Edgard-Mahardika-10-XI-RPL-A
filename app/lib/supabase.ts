import { createBrowserClient } from "@supabase/ssr";

// ── Browser Client (untuk "use client" components) ──
// Backward compatible — ekspor "supabase" seperti sebelumnya,
// tapi sekarang pake createBrowserClient dari @supabase/ssr
// yang handle cookie refresh otomatis di browser.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── Utility: Get browser client baru ──
export function getBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
