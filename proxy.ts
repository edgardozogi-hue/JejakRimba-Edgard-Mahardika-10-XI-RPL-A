import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — ini penting biar token gak expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proteksi: route yang WAJIB login
  const protectedRoutes = ["/profil", "/booking"];
  const path = request.nextUrl.pathname;

  // Kalau belum login dan akses protected route → redirect ke /masuk
  if (
    !user &&
    protectedRoutes.some((route) => path.startsWith(route))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/masuk";
    // Bawa URL asli sebagai query parameter biar bisa redirect balik
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// Matcher: jalanin middleware di semua route KECUALI static assets
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
