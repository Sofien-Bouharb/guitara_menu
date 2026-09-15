"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  Utensils,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { BrandLogo } from "./brand-logo";

type MobileNavProps = {
  onLogout: () => void | Promise<void>;
};

export function MobileNav({ onLogout }: MobileNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Accueil", icon: LayoutDashboard },
    { href: "/admin/categories", label: "Catégories", icon: FolderTree },
    { href: "/admin/items", label: "Articles", icon: Utensils },
    { href: "/admin/announcements", label: "Annonces", icon: Bell },
    { href: "/admin/settings", label: "Réglages", icon: Settings },
  ];

  return (
    <>
      {/* Fixed mobile top header */}
      <header className="top-header top-header--mobile">
        <div className="top-header-left">
          <BrandLogo size="sm" showSubtitle={false} compactMobile={true} />
        </div>

        {/* Mobile Logout */}
        <button
          type="button"
          className="mobile-header-logout"
          onClick={onLogout}
          title="Déconnexion"
          aria-label="Déconnexion"
        >
          <LogOut size={19} />
        </button>
      </header>

      {/* Fixed mobile bottom navigation */}
      <nav
        className="mobile-bottom-nav"
        aria-label="Navigation mobile administrateur"
      >
        {navItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
