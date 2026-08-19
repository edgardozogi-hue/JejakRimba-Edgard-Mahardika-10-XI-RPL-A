import type { Metadata } from "next";
import AdminShell from "../components/AdminShell";
import { getServerClient } from "../lib/supabase-server";

export const metadata: Metadata = {
  title: "Admin — Komunitas Robotika",
  description: "Panel administrasi Komunitas Robotika (sewa alat camping & mendaki).",
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "/";

export default async function ProtectedLayout({
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

  if (isAdmin) {
    return <AdminShell userName={userName}>{children}</AdminShell>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
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
            Buka Situs Utama
          </a>
        </div>
      </div>
    </div>
  );
}