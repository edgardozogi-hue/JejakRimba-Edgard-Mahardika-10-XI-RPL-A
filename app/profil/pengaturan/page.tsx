"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User, Bell, Shield, Eye, EyeOff } from "lucide-react";
import PageShell from "../../components/PageShell";
import { supabase } from "../../lib/supabase";

export default function PengaturanPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const meta = data.user.user_metadata;
        const displayName =
          meta?.full_name ?? meta?.name ?? data.user.email?.split("@")[0] ?? "User";
        setUser({
          name: displayName,
          email: data.user.email ?? "",
        });
        setName(displayName);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        const displayName =
          meta?.full_name ?? meta?.name ?? session.user.email?.split("@")[0] ?? "User";
        setUser({
          name: displayName,
          email: session.user.email ?? "",
        });
        setName(displayName);
      } else {
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name },
      });
      if (error) throw error;
      setUser((prev) => (prev ? { ...prev, name } : prev));
      setMessage({ type: "success", text: "Profil berhasil diperbarui." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Gagal memperbarui profil." });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setMessage({ type: "success", text: "Kata sandi berhasil diubah." });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Gagal mengubah kata sandi." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-6 py-16">
          <div className="mb-8 h-6 w-32 animate-pulse rounded bg-surface-border" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-2xl bg-surface-border" />
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-bg-elevated">
            <User size={40} className="text-text-secondary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Kamu belum masuk
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Silakan masuk dulu untuk mengakses pengaturan.
          </p>
          <a
            href="/masuk"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover"
          >
            Masuk
          </a>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-6 py-8">
        {/* Back + title */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Kembali"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition hover:bg-surface hover:text-text-primary"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-display text-xl font-bold text-text-primary">Pengaturan</h1>
        </div>

        {/* Notification */}
        {message && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
              message.type === "success"
                ? "bg-moss/10 text-moss-light"
                : "bg-red-500/10 text-red-500"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* ── Profile Section ── */}
        <Section icon={User} title="Profil">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-surface-border bg-bg-elevated px-4 py-2.5 text-sm text-text-secondary outline-none"
              />
              <p className="mt-1 text-[11px] text-text-secondary">
                Email tidak bisa diubah di sini.
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-accent-hover disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </form>
        </Section>

        {/* ── Password Section ── */}
        <Section icon={Shield} title="Kata Sandi" className="mt-6">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 pr-10 text-sm text-text-primary outline-none transition focus:border-accent"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  aria-label={showNew ? "Sembunyikan" : "Tampilkan"}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-text-secondary">Minimal 6 karakter.</p>
            </div>
            <button
              type="submit"
              disabled={saving || !newPassword}
              className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-accent-hover disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Menyimpan..." : "Ubah Kata Sandi"}
            </button>
          </form>
        </Section>

        {/* ── Notifications Section (placeholder) ── */}
        <Section icon={Bell} title="Notifikasi" className="mt-6">
          <div className="space-y-3">
            <Toggle label="Pemberitahuan booking" defaultChecked />
            <Toggle label="Pengingat jadwal sewa" defaultChecked />
            <Toggle label="Promo dan rekomendasi" />
          </div>
        </Section>
      </div>
    </PageShell>
  );
}

/* ── Section wrapper ── */
function Section({
  icon: Icon,
  title,
  children,
  className = "",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-4 flex items-center gap-2">
        <Icon size={18} className="text-accent" />
        <h2 className="font-display text-base font-bold text-text-primary">{title}</h2>
      </div>
      <div className="rounded-2xl border border-surface-border bg-surface p-5">
        {children}
      </div>
    </section>
  );
}

/* ── Toggle switch ── */
function Toggle({
  label,
  defaultChecked = false,
}: {
  label: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm text-text-primary">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? "bg-accent" : "bg-surface-border"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-paper transition ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}
