import type { Metadata } from "next";
import { ShieldOff, ShieldCheck, ExternalLink } from "lucide-react";
import ThemeProvider from "./components/ThemeProvider";
import { LanguageProvider } from "./lib/i18n";
import { getServerClient } from "./lib/supabase-server";
import AdminShell from "./components/AdminShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin — Komunitas Robotika",
  description: "Panel administrasi Komunitas Robotika (sewa alat camping & mendaki).",
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "/";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let isAdmin = false;
  let userName: string | null = null;

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();
    if (profile?.role === "admin") {
      isAdmin = true;
      userName = profile.full_name ?? null;
    }
  }

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <LanguageProvider>
            {isAdmin ? (
              <AdminShell userName={userName}>{children}</AdminShell>
            ) : (
              <div className="flex min-h-screen items-center justify-center px-6">
                <div className="w-full max-w-md text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-bg-elevated">
                    <ShieldOff size={32} className="text-red-500" />
                  </div>
                  <h1 className="font-display text-2xl font-black uppercase tracking-tight text-text-primary">
                    Akses Ditolak
                  </h1>
                  <p className="mt-3 text-sm text-text-secondary">
                    Halaman ini khusus administrator. Akun kamu belum terdaftar sebagai admin
                    Komunitas Robotika.
                  </p>
                  <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <a
                      href={SITE_URL}
                      className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover"
                    >
                      <ExternalLink size={16} /> Buka Situs Utama
                    </a>
                    {!user && (
                      <a
                        href={`${SITE_URL}/masuk`}
                        className="inline-flex items-center gap-2 rounded-xl border border-surface-border px-6 py-3 text-sm font-semibold text-text-primary transition hover:border-accent/40"
                      >
                        <ShieldCheck size={16} /> Masuk
                      </a>
                    )}
                    {user && (
                      <a
                        href={`${SITE_URL}/admin/login`}
                        className="inline-flex items-center gap-2 rounded-xl border border-accent/40 px-6 py-3 text-sm font-semibold text-accent transition hover:bg-accent/10"
                      >
                        <ShieldCheck size={16} /> Admin Login
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}