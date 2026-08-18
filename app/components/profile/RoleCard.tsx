"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, UserRound, Store, ShieldOff, Building2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { RenterSwitchModal } from "./RenterSwitchModal";
import { VendorRegisterModal } from "./VendorRegisterModal";
import { switchToVendor } from "@/actions/profile";

function roleKey(role: string) {
  if (role === "vendor") return "settings.role_vendor";
  if (role === "admin") return "settings.role_admin";
  return "settings.role_renter";
}

export function RoleCard({
  role,
  hasVendor,
  onRoleChanged,
}: {
  role: string;
  hasVendor?: boolean;
  onRoleChanged?: () => void;
}) {
  const { t } = useLanguage();
  const [openRenterSwitch, setOpenRenterSwitch] = useState(false);
  const [openVendorRegister, setOpenVendorRegister] = useState(false);
  const [success, setSuccess] = useState(false);
  const [switchingToVendor, setSwitchingToVendor] = useState(false);

  const isVendor = role === "vendor";
  const isAdmin = role === "admin";
  const currentRole = t(roleKey(role));

  const handleSuccess = () => {
    setSuccess(true);
    setOpenRenterSwitch(false);
    onRoleChanged?.();
    window.location.reload();
  };

  const handleVendorRegisterSuccess = () => {
    setSuccess(true);
    setOpenVendorRegister(false);
    onRoleChanged?.();
    window.location.reload();
  };

  const handleSwitchToVendor = async (password: string) => {
    setSwitchingToVendor(true);
    const res = await switchToVendor(password);
    setSwitchingToVendor(false);
    if (res.error) {
      return res.error;
    }
    handleSuccess();
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {success && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-xl bg-moss/10 px-4 py-3 text-sm font-medium text-moss-light"
        >
          {t("settings.switch_success")}
        </motion.p>
      )}

      {/* Current role */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
          <ShieldCheck size={22} className="text-accent" />
        </div>
        <div>
          <p className="text-xs font-medium text-text-secondary">
            {t("settings.current_role")}
          </p>
          <p className="font-display text-base font-bold text-text-primary">{currentRole}</p>
        </div>
      </div>

      {isAdmin ? (
        <p className="text-sm text-text-secondary">{t("settings.role_admin")}</p>
      ) : isVendor ? (
        <div className="rounded-xl border border-surface-border bg-bg-elevated p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
              <Store size={20} className="text-accent" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-text-primary">{t("settings.switch_to_renter")}</h4>
              <p className="mt-1 text-sm text-text-secondary">
                {t("settings.switch_vendor_desc")}
              </p>
              <button
                onClick={() => setOpenRenterSwitch(true)}
                className="mt-3 flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-paper transition hover:bg-accent-hover"
              >
                <UserRound size={16} />
                <span>{t("settings.switch_to_renter")}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-surface-border bg-bg-elevated p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
              <Building2 size={20} className="text-accent" />
            </div>
            <div className="flex-1">
              {hasVendor ? (
                <>
                  <h4 className="font-medium text-text-primary">{t("settings.switch_to_vendor")}</h4>
                  <p className="mt-1 text-sm text-text-secondary">
                    {t("settings.switch_renter_desc")}
                  </p>
                  <button
                    onClick={() => setOpenRenterSwitch(true)}
                    className="mt-3 flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-paper transition hover:bg-accent-hover"
                  >
                    <Store size={16} />
                    <span>{t("settings.switch_to_vendor")}</span>
                  </button>
                </>
              ) : (
                <>
                  <h4 className="font-medium text-text-primary">{t("settings.register_as_vendor")}</h4>
                  <p className="mt-1 text-sm text-text-secondary">
                    {t("settings.switch_renter_desc")}
                  </p>
                  <button
                    onClick={() => setOpenVendorRegister(true)}
                    className="mt-3 flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-paper transition hover:bg-accent-hover"
                  >
                    <Building2 size={16} />
                    <span>{t("settings.register_as_vendor")}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <RenterSwitchModal
        open={openRenterSwitch}
        onClose={() => setOpenRenterSwitch(false)}
        onSuccess={handleSuccess}
        mode={role === "vendor" ? "to-renter" : "to-vendor"}
        onSubmit={role === "renter" ? handleSwitchToVendor : undefined}
      />

      <VendorRegisterModal
        open={openVendorRegister}
        onClose={() => setOpenVendorRegister(false)}
        onSuccess={handleVendorRegisterSuccess}
      />
    </motion.div>
  );
}