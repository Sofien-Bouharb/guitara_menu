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
  Database,
} from "lucide-react";
import { BrandLogo } from "./brand-logo";
import { useAdminStore } from "@/lib/store-context";

export function MobileNav() {
  const pathname = usePathname();
  const { isStaticMode, setIsStaticMode } = useAdminStore();

  const navItems = [
    { href: "/admin", label: "Accueil", icon: LayoutDashboard },
    { href: "/admin/categories", label: "Sections", icon: FolderTree },
    { href: "/admin/items", label: "Articles", icon: Utensils },
    { href: "/admin/announcements", label: "Annonces", icon: Bell },
    { href: "/admin/settings", label: "Réglages", icon: Settings },
  ];

  return (
    <>
      {/* FIXED TOP HEADER (Fixed in place when scrolling) */}
      <header className="top-header top-header--mobile">
        <div className="top-header-left">
          <BrandLogo size="sm" showSubtitle={false} compactMobile={true} />
        </div>
      </header>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <nav className="mobile-bottom-nav">
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
