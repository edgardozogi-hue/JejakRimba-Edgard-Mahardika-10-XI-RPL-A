"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Compass, Ticket, User } from "lucide-react";
import { spring } from "../lib/animations";

const NAV_ITEMS = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/katalog", label: "Katalog", icon: Compass },
  { href: "/booking", label: "Booking", icon: Ticket },
  { href: "/profil", label: "Profil", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-border bg-nav-bg md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium"
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={isActive ? { duration: 0.4, ease: "easeOut" } : spring}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.4 : 1.8}
                  className={isActive ? "text-accent" : "text-text-secondary"}
                />
              </motion.div>
              <motion.span
                className={isActive ? "text-accent" : "text-text-secondary"}
                animate={isActive ? { y: [0, -2, 0] } : { y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)] bg-nav-bg" />
    </nav>
  );
}
