"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Shield, Bell, Activity, Settings as SettingsIcon, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import PageShell from "@/components/PageShell";
import { useLanguage } from "@/lib/i18n";
import { getProfileWithPrefs, updateProfile, updatePassword, type ProfileWithPrefs } from "@/actions/profile";
import { SidebarNav } from "@/components/profile/SidebarNav";
import { SectionCard } from "@/components/profile/SectionCard";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { PasswordStrength } from "@/components/profile/PasswordStrength";
import { NotificationPrefs } from "@/components/profile/NotificationPrefs";
import { ActiveSessions } from "@/components/profile/ActiveSessions";
import { DangerZone } from "@/components/profile/DangerZone";
import { RoleCard } from "@/components/profile/RoleCard";

export default function PengaturanPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [data, setData] = useState<ProfileWithPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [notAuthed, setNotAuthed] = useState(false);

  // Profile form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await getProfileWithPrefs();
      if (cancelled) return;
      if (res.error === "Not authenticated") {
        setNotAuthed(true);
        setLoading(false);
        return;
      }
      setData(res);
      setName(res.profile?.full_name ?? "");
      setPhone(res.profile?.phone ?? "");
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setMessage(null);
    const res = await updateProfile({ full_name: name });
    setSavingProfile(false);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: t("settings.saved") });
    }
  };

  const handleAvatarUpload = async (url: string) => {
    setMessage(null);
    const res = await updateProfile({ avatar_url: url });
    if (res.error) setMessage({ type: "error", text: res.error });
    else setMessage({ type: "success", text: t("settings.saved") });
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: t("settings.password_mismatch") });
      return;
    }
    setSavingPassword(true);
    setMessage(null);
    const res = await updatePassword(currentPassword, newPassword);
    setSavingPassword(false);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: t("settings.password_updated") });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-border" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
            <div className="h-64 animate-pulse rounded-2xl bg-surface-border" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl bg-surface-border" />
              ))}
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (notAuthed || !data?.user) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-bg-elevated">
            <User size={40} className="text-text-secondary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">{t("profil.belum_masuk")}</h1>
          <p className="mt-2 text-sm text-text-secondary">{t("profil.desc")}</p>
          <a
            href="/masuk"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-hover"
          >
            {t("auth.masuk")}
          </a>
        </div>
      </PageShell>
    );
  }

  const role = data.profile?.role ?? "renter";
  const hasVendor = !!data.vendor;

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label={t("common.back")}
            className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition hover:bg-surface hover:text-text-primary"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary">{t("settings.title")}</h1>
            <p className="mt-0.5 text-sm text-text-secondary">{t("settings.desc")}</p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
              message.type === "success" ? "bg-moss/10 text-moss-light" : "bg-red-500/10 text-red-500"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <SidebarNav
            userName={name || data.user.email.split("@")[0]}
            userEmail={data.user.email}
            userRole={role}
          />

          {/* Content */}
          <div className="space-y-6 min-w-0">
            {/* Profile */}
            <section id="profil" className="scroll-mt-24">
              <SectionCard titleKey="settings.profile_section" icon={User}>
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-medium text-text-primary">{t("settings.avatar")}</h3>
                      <p className="mt-0.5 text-sm text-text-secondary">{t("settings.avatar_desc")}</p>
                    </div>
                    <AvatarUpload
                      currentAvatar={data.profile?.avatar_url}
                      onUpload={handleAvatarUpload}
                    />
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("settings.full_name")}</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/20"
                        required
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("auth.email")}</label>
                        <input
                          type="email"
                          value={data.user.email}
                          disabled
                          className="w-full cursor-not-allowed rounded-xl border border-surface-border bg-bg-elevated px-4 py-2.5 text-sm text-text-secondary outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("settings.phone")}</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+62..."
                          className="w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/20"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-accent-hover disabled:opacity-50"
                      >
                        {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <User size={16} />}
                        {savingProfile ? t("common.saving") : t("common.simpan")}
                      </button>
                    </div>
                  </form>
                </div>
              </SectionCard>
            </section>

            {/* Security */}
            <section id="kata-sandi" className="scroll-mt-24">
              <SectionCard titleKey="settings.security_section" icon={Shield}>
                <p className="mb-5 text-sm text-text-secondary">{t("settings.security_desc")}</p>
                <form onSubmit={handlePassword} className="space-y-4">
                  {[
                    { key: "current" as const, label: t("settings.current_password"), value: currentPassword, setter: setCurrentPassword, show: showCurrent, setShow: setShowCurrent },
                    { key: "new" as const, label: t("settings.new_password"), value: newPassword, setter: setNewPassword, show: showNew, setShow: setShowNew },
                    { key: "confirm" as const, label: t("settings.confirm_password"), value: confirmPassword, setter: setConfirmPassword, show: showConfirm, setShow: setShowConfirm },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="mb-1.5 block text-xs font-medium text-text-secondary">{f.label}</label>
                      <div className="relative">
                        <input
                          type={f.show ? "text" : "password"}
                          value={f.value}
                          onChange={(e) => f.setter(e.target.value)}
                          className="w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 pr-10 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/20"
                          required={f.key !== "confirm" || f.value !== ""}
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => f.setShow(!f.show)}
                          className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface hover:text-text-primary"
                          aria-label={f.show ? "hidden" : "show"}
                        >
                          {f.show ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <PasswordStrength password={newPassword} />
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                      className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-accent-hover disabled:opacity-50"
                    >
                      {savingPassword ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                      {savingPassword ? t("common.saving") : t("settings.update_password")}
                    </button>
                  </div>
                </form>
              </SectionCard>
            </section>

            {/* Notifications */}
            <section id="notifikasi" className="scroll-mt-24">
              <SectionCard titleKey="settings.notifications_section" icon={Bell}>
                <p className="mb-5 text-sm text-text-secondary">{t("settings.notifications_desc")}</p>
                <NotificationPrefs />
              </SectionCard>
            </section>

            {/* Account Role */}
            <section id="peran" className="scroll-mt-24">
              <SectionCard titleKey="settings.role_section" icon={ShieldCheck}>
                <RoleCard role={role} hasVendor={hasVendor} />
              </SectionCard>
            </section>

            {/* Active Sessions */}
            <section id="sesi-aktif" className="scroll-mt-24">
              <SectionCard titleKey="settings.sessions_section" icon={Activity}>
                <ActiveSessions />
              </SectionCard>
            </section>

            {/* Danger Zone */}
            <section id="zona-bahaya" className="scroll-mt-24">
              <SectionCard titleKey="settings.danger_section" icon={SettingsIcon} danger>
                <p className="mb-5 text-sm text-red-500/80">{t("settings.danger_desc")}</p>
                <DangerZone />
              </SectionCard>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  );
}