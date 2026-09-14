"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Smartphone,
  Sparkles,
  Info,
  Coffee,
  Search,
  Star,
  Clock,
  Wifi,
  ChevronRight,
  Maximize2,
  Minimize2,
  Check,
  Flame,
} from "lucide-react";
import { useAdminStore } from "@/lib/store-context";
import { formatPrice } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

interface CustomerMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerMenuModal({ isOpen, onClose }: CustomerMenuModalProps) {
  const { categories, items, announcements, settings } = useAdminStore();
  const [selectedCatId, setSelectedCatId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeItemModal, setActiveItemModal] = useState<MenuItem | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const activeCategories = useMemo(
    () => categories.filter((c) => c.is_active).sort((a, b) => a.display_order - b.display_order),
    [categories]
  );
  const activeAnnouncements = useMemo(
    () => announcements.filter((a) => a.is_active),
    [announcements]
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!item.is_available) return false;
      const categoryIsActive = categories.some((c) => c.id === item.category_id && c.is_active);
      if (!categoryIsActive) return false;

      const matchesCat = selectedCatId === "all" || item.category_id === selectedCatId;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCat && matchesSearch;
    });
  }, [items, categories, selectedCatId, searchQuery]);

  const featuredItems = useMemo(
    () => filteredItems.filter((item) => item.is_featured),
    [filteredItems]
  );

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay !p-0 sm:!p-4 bg-black/80 flex items-center justify-center z-[150] animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Smartphone Device Container */}
      <div
        className={`relative bg-[#1A1613] transition-all duration-300 flex flex-col overflow-hidden ${
          isFullscreen
            ? "w-full h-full rounded-none"
            : "w-full max-w-[410px] h-[92vh] max-h-[820px] lg:max-h-[780px] rounded-[42px] border-[10px] border-[#2A241F] shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Device Top Status Bar & Notch */}
        <div className="bg-[#120F0D] text-[#D6C0A3] px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-bold select-none flex-shrink-0 z-30 relative">
          <span>13:37</span>

          {/* Dynamic Island / Camera Notch */}
          <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1F1915]" />
          </div>

          <div className="flex items-center gap-1.5 text-[#B99A73]">
            <Wifi size={12} />
            <span className="text-[9px]">5G</span>
            <div className="w-4 h-2 rounded-sm border border-[#B99A73] p-0.5 flex items-center">
              <div className="w-full h-full bg-[#B99A73] rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Admin Phone Control Header */}
        <div className="bg-[#241E1A] text-[#F0E3D2] px-4 py-2 flex items-center justify-between border-b border-[#3A2A1C] text-xs font-semibold flex-shrink-0 z-30">
          <div className="flex items-center gap-1.5">
            <Smartphone size={15} className="text-[#B99A73]" />
            <span className="font-bold text-[11.5px]">Aperçu Smartphone (QR Code)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#D6C0A3] transition-colors"
              title={isFullscreen ? "Réduire l'aperçu" : "Plein écran"}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
              title="Fermer la prévisualisation"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Phone Content Screen (Scrollable Web App) */}
        <div className="flex-1 overflow-y-auto bg-[#F8F4EE] text-[#3A2A1C] relative scroll-smooth no-scrollbar">
          {/* Cover Hero Banner */}
          <div className="relative bg-gradient-to-b from-[#3A2A1C] to-[#241E1A] text-[#F0E3D2] p-5 pb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#8A6848]/40 border border-[#B99A73]/30 text-[#F0E3D2]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ouvert • 08h00 - 22h00
              </span>
              <span className="text-xs font-extrabold text-[#B99A73] flex items-center gap-1">
                <Star size={13} className="fill-[#B99A73]" />
                4.9 (120+ avis)
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <Coffee size={22} className="text-[#B99A73]" />
                GUITARA CAFE
              </div>
              <p className="text-xs text-[#D6C0A3] font-medium">
                Espace Co-working & Menu Université
              </p>
            </div>

            {/* Workspace Fee Banner */}
            {settings.workspace_extra_fee_message && (
              <div className="bg-[#2E241C] border border-[#B99A73]/40 p-2.5 rounded-xl text-[11px] text-[#F0E3D2] flex items-start gap-2 shadow-sm">
                <Info size={15} className="text-[#B99A73] flex-shrink-0 mt-0.5" />
                <span className="leading-tight">{settings.workspace_extra_fee_message}</span>
              </div>
            )}
          </div>

          {/* Active Announcements Section */}
          {activeAnnouncements.length > 0 && (
            <div className="p-3 pb-1 space-y-2">
              {activeAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 shadow-sm transition-transform active:scale-98 ${
                    ann.variant === "promo"
                      ? "bg-[#F3E5F5] border-[#CE93D8] text-[#6A1B9A]"
                      : ann.variant === "warning"
                      ? "bg-[#FFF3E0] border-[#FFE0B2] text-[#E65100]"
                      : ann.variant === "success"
                      ? "bg-[#E8F5E9] border-[#A5D6A7] text-[#2E7D32]"
                      : "bg-[#E1F5FE] border-[#B3E5FC] text-[#0277BD]"
                  }`}
                >
                  <Sparkles size={16} className="mt-0.5 flex-shrink-0" />
                  <div>
                    {ann.title && <div className="font-extrabold mb-0.5">{ann.title}</div>}
                    <div className="leading-snug text-[11.5px]">{ann.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sticky Search & Category Bar */}
          <div className="sticky top-0 z-20 bg-[#F8F4EE]/95 backdrop-blur-md p-3 border-b border-[#D6C0A3]/50 space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#725D4C]" />
              <input
                type="text"
                placeholder="Rechercher un café, crêpe, smoothie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#D6C0A3] rounded-full py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-[#8A6848] shadow-xs placeholder-[#725D4C]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#725D4C]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Pills Bar */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
              <button
                onClick={() => setSelectedCatId("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCatId === "all"
                    ? "bg-[#8A6848] text-white shadow-sm"
                    : "bg-white border border-[#D6C0A3] text-[#3A2A1C]"
                }`}
              >
                Tout ({filteredItems.length})
              </button>
              {activeCategories.map((cat) => {
                const count = items.filter(
                  (i) => i.category_id === cat.id && i.is_available
                ).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      selectedCatId === cat.id
                        ? "bg-[#8A6848] text-white shadow-sm"
                        : "bg-white border border-[#D6C0A3] text-[#3A2A1C]"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedCatId === cat.id
                          ? "bg-white/20 text-white"
                          : "bg-[#F0E3D2] text-[#8A6848]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Featured Highlights Section */}
          {selectedCatId === "all" && !searchQuery && featuredItems.length > 0 && (
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#8A6848]">
                <Flame size={15} className="fill-[#8A6848]" />
                <span>Nos Coups de Cœur</span>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {featuredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveItemModal(item)}
                    className="w-40 bg-white p-2.5 rounded-2xl border border-[#D6C0A3] shadow-sm flex-shrink-0 cursor-pointer hover:border-[#8A6848] transition-all space-y-1.5"
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-24 rounded-xl object-cover bg-[#F0E3D2]"
                    />
                    <div className="font-bold text-xs text-[#3A2A1C] truncate">
                      {item.name}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-[#8A6848]">
                        {item.has_variants ? "Variantes" : formatPrice(item.price)}
                      </span>
                      <span className="text-[10px] font-bold text-white bg-[#8A6848] px-1.5 py-0.5 rounded-md">
                        Voir
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Sections & Items List */}
          <div className="p-3 space-y-5 pb-12">
            {filteredItems.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-[#D6C0A3] space-y-2">
                <Coffee size={28} className="mx-auto text-[#8A6848]" />
                <div className="font-bold text-sm text-[#3A2A1C]">
                  Aucun article trouvé
                </div>
                <p className="text-xs text-[#725D4C]">
                  Essayez un autre mot-clé ou changez de catégorie.
                </p>
              </div>
            ) : (
              activeCategories
                .filter((cat) => selectedCatId === "all" || selectedCatId === cat.id)
                .map((cat) => {
                  const catItems = filteredItems.filter((i) => i.category_id === cat.id);
                  if (catItems.length === 0) return null;

                  return (
                    <div key={cat.id} className="space-y-2.5">
                      {/* Section Title */}
                      <div className="flex items-center justify-between border-b border-[#D6C0A3]/60 pb-1.5">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm text-[#3A2A1C]">
                            {cat.name}
                          </h3>
                          <span className="text-[10px] font-bold text-[#8A6848] bg-[#F0E3D2] px-2 py-0.5 rounded-full">
                            {catItems.length}
                          </span>
                        </div>
                      </div>

                      {/* Items Cards Grid */}
                      <div className="space-y-2.5">
                        {catItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setActiveItemModal(item)}
                            className="bg-white p-3 rounded-2xl border border-[#D6C0A3]/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex gap-3 items-center group"
                          >
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-16 h-16 rounded-xl object-cover bg-[#F0E3D2] flex-shrink-0 group-hover:scale-105 transition-transform"
                            />

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-start justify-between gap-1">
                                <h4 className="font-bold text-xs sm:text-sm text-[#3A2A1C] group-hover:text-[#8A6848] transition-colors truncate">
                                  {item.name}
                                </h4>
                                <span className="font-extrabold text-xs text-[#8A6848] whitespace-nowrap">
                                  {item.has_variants ? "Variantes" : formatPrice(item.price)}
                                </span>
                              </div>

                              {item.description && (
                                <p className="text-[11px] text-[#725D4C] line-clamp-1 leading-snug">
                                  {item.description}
                                </p>
                              )}

                              {item.has_variants && item.menu_item_variants && (
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                  {item.menu_item_variants
                                    .filter((v) => v.is_available)
                                    .slice(0, 3)
                                    .map((v) => (
                                      <span
                                        key={v.id}
                                        className="bg-[#FAF6F0] border border-[#D6C0A3]/60 px-1.5 py-0.2 rounded text-[9.5px] text-[#3A2A1C]"
                                      >
                                        {v.name}: {formatPrice(v.price)}
                                      </span>
                                    ))}
                                </div>
                              )}
                            </div>

                            <ChevronRight size={16} className="text-[#D6C0A3] group-hover:text-[#8A6848] flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Item Detail Popover Sheet */}
        {activeItemModal && (
          <div
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end animate-in fade-in duration-150"
            onClick={() => setActiveItemModal(null)}
          >
            <div
              className="w-full bg-white rounded-t-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={activeItemModal.image_url}
                    alt={activeItemModal.name}
                    className="w-14 h-14 rounded-2xl object-cover bg-[#F0E3D2]"
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-[#3A2A1C]">
                      {activeItemModal.name}
                    </h3>
                    <p className="text-xs text-[#8A6848] font-bold">
                      {activeItemModal.categories?.name || "Catégorie"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveItemModal(null)}
                  className="p-1 rounded-full bg-[#FAF6F0] text-[#3A2A1C]"
                >
                  <X size={18} />
                </button>
              </div>

              {activeItemModal.description && (
                <p className="text-xs text-[#725D4C] leading-relaxed bg-[#FAF6F0] p-3 rounded-xl border border-[#D6C0A3]/50">
                  {activeItemModal.description}
                </p>
              )}

              {/* Variants Price List */}
              {activeItemModal.has_variants && activeItemModal.menu_item_variants && (
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-[#3A2A1C] block">
                    Options & Variantes Disponibles :
                  </span>
                  <div className="space-y-1.5">
                    {activeItemModal.menu_item_variants
                      .filter((v) => v.is_available)
                      .map((variant) => (
                        <div
                          key={variant.id}
                          className="flex justify-between items-center bg-[#FFFDF9] p-2.5 rounded-xl border border-[#D6C0A3]"
                        >
                          <span className="text-xs font-bold text-[#3A2A1C]">
                            {variant.name}
                          </span>
                          <span className="text-xs font-black text-[#8A6848]">
                            {formatPrice(variant.price)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {!activeItemModal.has_variants && (
                <div className="flex justify-between items-center bg-[#FAF6F0] p-3 rounded-xl border border-[#D6C0A3]">
                  <span className="text-xs font-bold text-[#3A2A1C]">Prix du produit</span>
                  <span className="text-base font-black text-[#8A6848]">
                    {formatPrice(activeItemModal.price)}
                  </span>
                </div>
              )}

              <button
                onClick={() => setActiveItemModal(null)}
                className="w-full btn btn-primary text-xs py-3 flex items-center justify-center gap-1.5"
              >
                <Check size={16} />
                <span>Fermer la fiche produit</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Device Indicator */}
        <div className="bg-[#1C1714] text-[#D6C0A3] px-4 py-2 text-center text-[10.5px] font-semibold border-t border-[#2A241F] flex-shrink-0 z-30 flex items-center justify-between">
          <span>Mode Smartphone Client</span>
          <span className="text-[#B99A73] font-bold">100% Synchronisé avec l'Admin</span>
        </div>
      </div>
    </div>
  );
}
