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

        {/* Mode Indicator Badge */}
        <div className="sidebar-mode-badge">
          <div className="sidebar-mode-header">
            <span className="sidebar-mode-header-label">
              <CheckCircle2 size={14} />
              Mode Statique Démo
            </span>
          </div>
          <p className="sidebar-mode-desc">
            Testez l&apos;interface librement. Vos modifications s&apos;enregistrent en mémoire.
          </p>
          <button
            onClick={() => setIsStaticMode(!isStaticMode)}
            className="sidebar-mode-btn"
          >
            <Database size={13} />
            <span>{isStaticMode ? "Connecter à Supabase" : "Mode Statique Actif"}</span>
          </button>
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
              Université Guitara Space • Admin Panel
            </span>
          </div>

          <div className="top-header-right">
            <button
              onClick={() => setIsStaticMode(!isStaticMode)}
              className={`mode-toggle-btn ${isStaticMode ? "mode-toggle-btn--static" : "mode-toggle-btn--live"}`}
            >
              <Database size={13} />
              <span>{isStaticMode ? "Mode Statique UI" : "Supabase Connecté"}</span>
            </button>
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
