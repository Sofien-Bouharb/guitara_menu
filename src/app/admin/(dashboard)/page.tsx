"use client";

import React from "react";
import Link from "next/link";
import {
  FolderTree,
  Utensils,
  Bell,
  Clock,
  Plus,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useAdminStore } from "@/lib/store-context";
import { formatPrice } from "@/lib/format";

export default function AdminDashboardPage() {
  const { categories, items, announcements, settings, toggleItemAvailability } =
    useAdminStore();

  const totalCategories = categories.length;
  const totalItems = items.length;
  const activeAnnouncements = announcements.filter((a) => a.is_active).length;
  const availableItems = items.filter((i) => i.is_available).length;

  return (
    <div className="page-content">
      {/* Header */}
      <PageHeader
        title="Tableau de Bord Admin"
        description="Vue d'ensemble et gestion rapide de votre espace café."
        action={
          <Link href="/admin/items" className="btn btn-primary">
            <Plus size={15} />
            <span>Nouveau Produit</span>
          </Link>
        }
      />

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-4">
        {/* Card 1: Categories */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Catégories</span>
            <div className="kpi-card-icon">
              <FolderTree size={16} />
            </div>
          </div>
          <div>
            <div className="kpi-card-value">{totalCategories}</div>
            <p className="kpi-card-meta">
              <span className="highlight">{categories.filter(c => c.is_active).length} actives</span> sur le menu
            </p>
          </div>
        </div>

        {/* Card 2: Items */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Produits</span>
            <div className="kpi-card-icon">
              <Utensils size={16} />
            </div>
          </div>
          <div>
            <div className="kpi-card-value">{totalItems}</div>
            <p className="kpi-card-meta">
              <span className="highlight">{availableItems} disponibles</span>
            </p>
          </div>
        </div>

        {/* Card 3: Announcements */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Annonces</span>
            <div className="kpi-card-icon">
              <Bell size={16} />
            </div>
          </div>
          <div>
            <div className="kpi-card-value">{activeAnnouncements}</div>
            <p className="kpi-card-meta">Messages actifs</p>
          </div>
        </div>

        {/* Card 4: Workspace Fee */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-label">Tarif Longue Durée</span>
            <div className="kpi-card-icon">
              <Clock size={16} />
            </div>
          </div>
          <div>
            <div className="kpi-card-value kpi-card-value--accent">
              {formatPrice(settings.workspace_extra_hourly_fee)} <small>/h</small>
            </div>
            <p className="kpi-card-meta">Espace co-working</p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-split">
        {/* Left Column: Quick Stock Toggles */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Gestion Rapide des Stocks</h2>
              <p>Activez ou masquez un produit en 1 clic.</p>
            </div>
            <Link href="/admin/items" className="panel-link">
              <span>Tout voir</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="stock-list">
            {items.slice(0, 5).map((item) => (
              <div key={item.id} className="stock-row">
                <div className="stock-row-info">
                  <img
                    src={item.image_url || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80"}
                    alt={item.name}
                    className="stock-row-thumb"
                  />
                  <div className="stock-row-text">
                    <h3 className="stock-row-name">{item.name}</h3>
                    <div className="stock-row-detail">
                      <span>{item.categories?.name || "Catégorie"}</span>
                      <span>•</span>
                      <span className="price">
                        {item.has_variants ? "Variantes" : formatPrice(item.price)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="stock-row-controls">
                  <span className={`stock-status ${item.is_available ? "stock-status--available" : "stock-status--hidden"}`}>
                    {item.is_available ? "En Stock" : "Masqué"}
                  </span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={item.is_available}
                      onChange={() => toggleItemAvailability(item.id)}
                    />
                    <span className="slider" />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Shortcuts */}
        <div className="side-stack">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Raccourcis Admin</h2>
                <p>Accès direct aux fonctionnalités.</p>
              </div>
            </div>

            <div className="shortcuts-grid">
              <Link href="/admin/categories" className="shortcut-card">
                <FolderTree size={16} />
                <span>Gérer Catégories</span>
              </Link>

              <Link href="/admin/items" className="shortcut-card">
                <Utensils size={16} />
                <span>Ajouter Produit</span>
              </Link>

              <Link href="/admin/announcements" className="shortcut-card">
                <Bell size={16} />
                <span>Créer Annonce</span>
              </Link>

              <Link href="/admin/settings" className="shortcut-card">
                <Clock size={16} />
                <span>Tarif Co-working</span>
              </Link>
            </div>
          </section>

          {/* Demo Mode Status Card */}
          <section className="panel panel--muted">
            <div className="status-info-card">
              <Sparkles size={16} />
              <span>Statut Interface RWD</span>
            </div>
            <p className="status-info-desc">
              Design mobile 100% réactif (RWD) compatible avec les écrans compacts (iPhone SE / Android).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
