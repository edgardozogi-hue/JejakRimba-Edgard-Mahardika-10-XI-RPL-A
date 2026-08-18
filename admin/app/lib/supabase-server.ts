import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// ── Server Client (untuk server actions & server components) ──
// Panggil fungsi ini di setiap server action/server component.
// Beda cookie store per request — harus panggil baru tiap action.
export async function getServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// ── Service Role Client (hanya untuk server) ──
// Bypass RLS untuk operasi terkurasi seperti menyimpan profil saat sign-up
// (user baru belum punya session sehingga auth.uid() kosong).
// JANGAN pernah dipakai dari "use client" — hanya di server action.
export function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
