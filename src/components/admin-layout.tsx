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
  Coffee,
  Database,
  CheckCircle2,
} from "lucide-react";
import { AdminStoreProvider, useAdminStore } from "@/lib/store-context";
import { BrandLogo } from "./brand-logo";
import { MobileNav } from "./mobile-nav";

const navItems = [
  { href: "/admin", label: "Tableau de Bord", icon: LayoutDashboard },
  { href: "/admin/categories", label: "Catégories", icon: FolderTree },
  { href: "/admin/items", label: "Articles & Menu", icon: Utensils },
  { href: "/admin/announcements", label: "Annonces Homepage", icon: Bell },
  { href: "/admin/settings", label: "Réglages Espace", icon: Settings },
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isStaticMode, setIsStaticMode } = useAdminStore();

  return (
    <div className="admin-shell">
      {/* Desktop Sidebar Layout */}
      <aside className="sidebar">
        <div className="brand-section">
          <BrandLogo size="md" variant="light" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="nav" aria-label="Navigation Administrateur">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-inner">
            <span className="sidebar-footer-brand">
              <Coffee size={15} />
              Admin Guitara
            </span>
            <Link
              href="/admin/login"
              className="sidebar-footer-logout"
              title="Déconnexion"
            >
              <LogOut size={15} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="main-container">
        {/* Mobile Navigation Header */}
        <MobileNav />

        {/* Desktop Header Top Bar */}
        <header className="top-header top-header--desktop">
          <div className="top-header-left">
            <span className="header-context-badge">
              Guitara • Interface Administrateur
            </span>
          </div>
        </header>

        {/* Main Content View */}
        <main className="content">{children}</main>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminStoreProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminStoreProvider>
  );
}
