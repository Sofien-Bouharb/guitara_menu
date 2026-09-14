"use client";

import React, { createContext, useContext, useState } from "react";
import type { Category, MenuItem, MenuItemVariant, Announcement, BusinessSettings } from "./types";
import { initialCategories, initialItems, initialAnnouncements, initialSettings } from "./static-data";

type AdminStoreContextType = {
  isStaticMode: boolean;
  setIsStaticMode: (val: boolean) => void;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  items: MenuItem[];
  setItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  settings: BusinessSettings;
  setSettings: React.Dispatch<React.SetStateAction<BusinessSettings>>;
  // CRUD helpers
  addCategory: (cat: Omit<Category, "id">) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addItem: (item: Omit<MenuItem, "id">, variants?: Omit<MenuItemVariant, "id" | "item_id">[]) => void;
  updateItem: (id: string, item: Partial<MenuItem>, variants?: MenuItemVariant[]) => void;
  deleteItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;
  toggleCategoryActive: (id: string) => void;
  addAnnouncement: (ann: Omit<Announcement, "id">) => void;
  updateAnnouncement: (id: string, ann: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  toggleAnnouncementActive: (id: string) => void;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
};

const AdminStoreContext = createContext<AdminStoreContextType | undefined>(undefined);

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [isStaticMode, setIsStaticMode] = useState<boolean>(true);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [settings, setSettings] = useState<BusinessSettings>(initialSettings);

  const addCategory = (catData: Omit<Category, "id">) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (id: string, catData: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...catData } : cat))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    setItems((prev) => prev.filter((item) => item.category_id !== id));
  };

  const toggleCategoryActive = (id: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, is_active: !cat.is_active } : cat))
    );
  };

  const addItem = (itemData: Omit<MenuItem, "id">, variantData?: Omit<MenuItemVariant, "id" | "item_id">[]) => {
    const newItemId = `item-${Date.now()}`;
    const category = categories.find((c) => c.id === itemData.category_id);
    
    const formattedVariants: MenuItemVariant[] | undefined = variantData?.map((v, idx) => ({
      ...v,
      id: `var-${Date.now()}-${idx}`,
      item_id: newItemId,
    }));

    const newItem: MenuItem = {
      ...itemData,
      id: newItemId,
      categories: category ? { name: category.name } : undefined,
      menu_item_variants: formattedVariants,
    };

    setItems((prev) => [newItem, ...prev]);
  };

  const updateItem = (id: string, itemData: Partial<MenuItem>, variants?: MenuItemVariant[]) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const catId = itemData.category_id || item.category_id;
        const category = categories.find((c) => c.id === catId);
        return {
          ...item,
          ...itemData,
          categories: category ? { name: category.name } : item.categories,
          menu_item_variants: variants !== undefined ? variants : item.menu_item_variants,
        };
      })
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleItemAvailability = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_available: !item.is_available } : item))
    );
  };

  const addAnnouncement = (annData: Omit<Announcement, "id">) => {
    const newAnn: Announcement = {
      ...annData,
      id: `ann-${Date.now()}`,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const updateAnnouncement = (id: string, annData: Partial<Announcement>) => {
    setAnnouncements((prev) =>
      prev.map((ann) => (ann.id === id ? { ...ann, ...annData } : ann))
    );
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((ann) => ann.id !== id));
  };

  const toggleAnnouncementActive = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((ann) => (ann.id === id ? { ...ann, is_active: !ann.is_active } : ann))
    );
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <AdminStoreContext.Provider
      value={{
        isStaticMode,
        setIsStaticMode,
        categories,
        setCategories,
        items,
        setItems,
        announcements,
        setAnnouncements,
        settings,
        setSettings,
        addCategory,
        updateCategory,
        deleteCategory,
        addItem,
        updateItem,
        deleteItem,
        toggleItemAvailability,
        toggleCategoryActive,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        toggleAnnouncementActive,
        updateSettings,
      }}
    >
      {children}
    </AdminStoreContext.Provider>
  );
}

export function useAdminStore() {
  const context = useContext(AdminStoreContext);
  if (!context) {
    throw new Error("useAdminStore must be used within an AdminStoreProvider");
  }
  return context;
}
