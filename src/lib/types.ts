export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string;
  display_order: number;
  is_active: boolean;
};

export type MenuItemVariant = {
  id: string;
  item_id: string;
  name: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  display_order: number;
};

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  slug: string | null;
  description: string | null;
  price: number | null;
  image_url: string;
  has_variants: boolean;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
  categories?: Pick<Category, "name">;
  menu_item_variants?: MenuItemVariant[];
};

export type Announcement = {
  id: string;
  title: string | null;
  message: string;
  variant: "info" | "promo" | "warning" | "success";
  placement: "banner" | "popup";
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  display_order: number;
};

export type BusinessSettings = {
  id: boolean;
  workspace_extra_hourly_fee: number;
  workspace_extra_fee_message: string;
};
