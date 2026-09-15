"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  FolderTree,
  Utensils,
  Bell,
  Clock,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { formatPrice } from "@/lib/format";
import { getDashboardData, toggleDashboardItemAvailability } from "./actions";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function handleToggleAvailability(id: string, currentAvailability: boolean) {
    const newAvailability = !currentAvailability;

    setData((current) => {
      if (!current) return current;

      return {
        ...current,
        items: current.items.map((item) =>
          item.id === id
            ? {
                ...item,
                is_available: newAvailability,
              }
            : item,
        ),
      };
    });

    startTransition(async () => {
      try {
        await toggleDashboardItemAvailability(id, newAvailability);
      } catch (error) {
        console.error("Failed to update item availability:", error);

        setData((current) => {
          if (!current) return current;

          return {
            ...current,
            items: current.items.map((item) =>
              item.id === id
                ? {
                    ...item,
                    is_available: currentAvailability,
                  }
                : item,
            ),
          };
        });
      }
    });
  }

  if (isLoading || !data) {
    return (
      <div className="page-content">
        <PageHeader
          title="Tableau de Bord Admin"
          description="Vue d'ensemble et gestion rapide de votre espace café."
        />

        <div className="grid grid-cols-4">
          {[1, 2, 3, 4].map((card) => (
            <div className="kpi-card" key={card}>
              <div className="kpi-card-header">
                <span className="kpi-card-label">Chargement...</span>
              </div>
              Produit
              <div className="kpi-card-value">—</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { categories, items, announcements, settings } = data;

  const totalCategories = categories.length;
  const totalItems = items.length;
  const activeAnnouncements = announcements.filter(
    (announcement) => announcement.is_active,
  ).length;
  const availableItems = items.filter((item) => item.is_available).length;

  return (
    <div className="page-content">
      {/* Header */}
      <PageHeader
        title="Tableau de Bord Admin"
        description="Vue d'ensemble et gestion rapide de votre espace café."
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
              <span className="highlight">
                {categories.filter((c) => c.is_active).length} actives
              </span>{" "}
              sur le menu
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
              {formatPrice(settings.workspace_extra_hourly_fee)}{" "}
              <small>/h</small>
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
              <h2>Produits en Vedette</h2>
              <p>Activez ou masquez rapidement un produit en vedette.</p>
            </div>

            <Link href="/admin/items" className="panel-link">
              <span>Voir tous les produits</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="stock-list">
            {items
              .filter((item) => item.is_featured)
              .slice(0, 5)
              .map((item) => (
                <div key={item.id} className="stock-row">
                  <div className="stock-row-info">
                    <img
                      src={
                        item.image_url ||
                        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80"
                      }
                      alt={item.name}
                      className="stock-row-thumb"
                    />

                    <div className="stock-row-text">
                      <h3 className="stock-row-name">{item.name}</h3>

                      <div className="stock-row-detail">
                        <span>{item.categories?.name || "Catégorie"}</span>

                        <span>•</span>

                        <span className="price">
                          {item.has_variants
                            ? "Variantes"
                            : formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="stock-row-controls">
                    <span
                      className={`stock-status ${
                        item.is_available
                          ? "stock-status--available"
                          : "stock-status--hidden"
                      }`}
                    >
                      {item.is_available ? "En Stock" : "Masqué"}
                    </span>

                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={item.is_available}
                        disabled={isPending}
                        onChange={() =>
                          handleToggleAvailability(item.id, item.is_available)
                        }
                      />

                      <span className="slider" />
                    </label>
                  </div>
                </div>
              ))}

            {items.length === 0 && (
              <div className="stock-row">
                <div className="stock-row-text">
                  <h3 className="stock-row-name">Aucun produit</h3>

                  <div className="stock-row-detail">
                    <span>Aucun produit n&apos;a encore été ajouté.</span>
                  </div>
                </div>
              </div>
            )}
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
        </div>
      </div>
    </div>
  );
}
