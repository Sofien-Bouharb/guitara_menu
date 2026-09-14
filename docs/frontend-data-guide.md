# Menu Guitara Frontend Data Guide

This document explains how the frontend and admin UI should use the Supabase database for the menu website.

The stack is:

- Next.js
- Supabase
- Vercel

The website has two main parts:

- Customer menu UI: public page opened from the QR code.
- Admin UI: protected dashboard where the owner can update menu content.

## Database Files

Current SQL files:

- `supabase/seed.sql`: seeds all current menu categories, items, and variants.
- `supabase/allow-empty-image-urls.sql`: removes non-empty image URL constraints so photos can be added later.
- `supabase/announcements.sql`: adds homepage messages for promos, closures, and notices.
- `supabase/business-settings.sql`: adds global workspace/cafe settings, including the long-stay hourly fee.

Expected core schema:

- `categories`
- `menu_items`
- `menu_item_variants`
- `profiles`
- `announcements`
- `business_settings`

## Core Data Model

### categories

Represents one menu section.

Examples:

- Nos Milkshakes
- Nos Cafés
- Nos Crêpes sucrées
- Nos Petits déjeuners

Fields the frontend needs:

| Field | Type | Usage |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `name` | text | Display name |
| `slug` | text | URL/hash-friendly identifier |
| `description` | text/null | Optional section subtitle |
| `image_url` | text | Category image URL, empty for now |
| `display_order` | integer | Sorting |
| `is_active` | boolean | Hide/show category |

Customer UI behavior:

- Only show active categories.
- Sort by `display_order`.
- If `image_url` is empty, show a fallback visual.
- Do not show categories that have no visible items unless you intentionally want empty sections.

Admin UI behavior:

- Admin can edit name, description, image URL, display order, and active state.
- Slug can be auto-generated from the name.
- It is safer to hide slug editing unless needed.

### menu_items

Represents a normal menu product or a parent item with variants.

Examples:

- Fraise milkshake
- Cappuccino
- Petit déjeuner express
- Café aromatisé

Fields the frontend needs:

| Field | Type | Usage |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `category_id` | uuid | Links item to category |
| `name` | text | Display name |
| `slug` | text/null | Stable identifier |
| `description` | text/null | Optional detail text |
| `price` | numeric/null | Price in DT |
| `image_url` | text | Item image URL, empty for now |
| `has_variants` | boolean | Whether item has child options |
| `is_available` | boolean | Hide/show item |
| `is_featured` | boolean | Optional highlight |
| `display_order` | integer | Sorting |

Customer UI behavior:

- Only show available items.
- Sort items by `display_order`.
- If `has_variants = false`, display `price`.
- If `has_variants = true`, display variants instead of parent `price`.
- If `image_url` is empty, show a fallback image/placeholder.
- Use `description` for breakfast details and special notes.

Admin UI behavior:

- For normal items, `price` is required.
- For items with variants, parent `price` can be empty.
- Admin should be able to toggle availability.
- Admin should be able to edit image URL.
- Admin should be able to mark featured items if the customer UI uses featured styling.

### menu_item_variants

Represents item options with their own prices.

Currently used for:

- Café aromatisé
  - Vanille
  - Caramel
  - Noisette
  - Pistache

Fields the frontend needs:

| Field | Type | Usage |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `item_id` | uuid | Parent menu item |
| `name` | text | Variant display name |
| `price` | numeric | Variant price |
| `image_url` | text/null | Optional variant image |
| `is_available` | boolean | Hide/show variant |
| `display_order` | integer | Sorting |

Customer UI behavior:

- Only show available variants.
- Sort variants by `display_order`.
- Variant image is optional.
- If variant image is empty, use the parent item image.

Admin UI behavior:

- Variants should be edited inside the parent item form.
- Each variant needs a name and price.
- Admin can add, edit, delete, reorder, and toggle variants.

## Announcements

The `announcements` table stores optional homepage messages.

Use cases:

- Discount on an item.
- Temporary closure.
- Special exam-period schedule.
- New menu item.

Fields:

| Field | Type | Usage |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `title` | text/null | Optional heading |
| `message` | text | Main announcement content |
| `variant` | text | `info`, `promo`, `warning`, or `success` |
| `placement` | text | `banner` or `popup` |
| `starts_at` | timestamptz/null | Optional start time |
| `ends_at` | timestamptz/null | Optional end time |
| `is_active` | boolean | Hide/show |
| `display_order` | integer | Sorting |

Customer UI behavior:

- Fetch active announcements.
- If there are no announcements, render nothing.
- Recommended default display is a top banner, not a popup.
- Use popup only for important messages, like closure notices.
- Apply color/style based on `variant`.

Suggested visual behavior:

- `info`: neutral note.
- `promo`: offer/discount styling.
- `warning`: closure or important notice.
- `success`: positive update.

Admin UI behavior:

- Admin can create, edit, delete announcements.
- Admin can choose variant and placement.
- Admin can set optional start/end dates.
- If start/end dates are empty, the announcement is active whenever `is_active = true`.

## Business Settings

The `business_settings` table stores global values that do not belong to one menu item.

It should contain exactly one row.

Current fields:

| Field | Type | Usage |
| --- | --- | --- |
| `workspace_extra_hourly_fee` | numeric | Extra fee per long-stay hour |
| `workspace_extra_fee_message` | text | Message shown to customers |

Current seeded value:

```txt
workspace_extra_hourly_fee = 0.500
workspace_extra_fee_message = Un supplément de 0.5 DT par heure peut être appliqué pour les longues durées.
```

Customer UI behavior:

- Show this as a small workspace policy note.
- It should be visible but not aggressive.
- Good placement: near the top, near opening info, or before menu sections.

Admin UI behavior:

- Create a simple settings page.
- Admin can edit the hourly fee.
- Admin can edit the displayed message.
- When fee changes, update the message or generate it automatically from the fee.

## Recommended Customer Page Layout

The customer opens the QR code and lands directly on the menu.

Suggested order:

1. Header with cafe/workspace name.
2. Optional announcements.
3. Workspace long-stay fee note.
4. Category navigation.
5. Menu sections.

Avoid making a marketing landing page. The user came for the menu.

Important mobile behavior:

- Category navigation should be sticky or easy to reach.
- Menu sections should be quick to scan.
- Prices should be visually aligned.
- Images should not slow the page too much.
- Empty image URLs should not create broken image icons.

## Recommended Admin Pages

Suggested admin routes:

```txt
/admin/login
/admin
/admin/categories
/admin/items
/admin/announcements
/admin/settings
```

Minimum useful admin features:

- Login/logout.
- View all categories.
- Add/edit/delete category.
- View all menu items.
- Add/edit/delete menu item.
- Manage variants for variant-based items.
- Toggle item availability.
- Edit image URLs.
- Add/edit/delete announcements.
- Edit workspace hourly fee.

Optional later features:

- Drag-and-drop category ordering.
- Drag-and-drop item ordering.
- Featured items.
- Preview customer menu from admin.
- Image upload integration with an external image host.

## Price Formatting

Prices are stored as numeric values, for example:

```txt
8.500
10.000
2.500
```

Frontend should format prices as Tunisian dinars.

Simple display examples:

```txt
8.5 DT
10 DT
2.5 DT
```

Suggested formatter logic:

- Remove unnecessary trailing zeros.
- Use `DT` consistently.
- Keep decimal point style consistent in the UI.

Example TypeScript helper:

```ts
export function formatPrice(price: number | string | null) {
  if (price === null) return "";

  const numericPrice = Number(price);

  return `${numericPrice.toLocaleString("fr-TN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })} DT`;
}
```

## Image Handling

The project is not using Supabase Storage.

Images will be external URLs stored in:

- `categories.image_url`
- `menu_items.image_url`
- `menu_item_variants.image_url`

For now, all seeded image URLs are empty strings.

Frontend must handle empty images:

```ts
const imageSrc = item.image_url || "/images/menu-placeholder.jpg";
```

Recommended:

- Use one category placeholder image.
- Use one item placeholder image.
- Do not render broken image icons.
- Later, store real URLs from Cloudinary, ImgBB, a CDN, or another image host.

## Supabase Query Examples

### Fetch categories with menu items

```ts
const { data, error } = await supabase
  .from("categories")
  .select(`
    id,
    name,
    slug,
    description,
    image_url,
    display_order,
    menu_items (
      id,
      name,
      slug,
      description,
      price,
      image_url,
      has_variants,
      is_available,
      is_featured,
      display_order,
      menu_item_variants (
        id,
        name,
        price,
        image_url,
        is_available,
        display_order
      )
    )
  `)
  .eq("is_active", true)
  .order("display_order", { ascending: true });
```

Note:

- Supabase nested ordering may need extra client-side sorting for nested `menu_items` and `menu_item_variants`.
- Because RLS hides unavailable items/variants for public users, public queries should only receive visible rows.

### Fetch announcements

```ts
const { data, error } = await supabase
  .from("announcements")
  .select("*")
  .order("display_order", { ascending: true });
```

RLS already filters public users to currently active announcements.

### Fetch business settings

```ts
const { data, error } = await supabase
  .from("business_settings")
  .select("*")
  .single();
```

## TypeScript Types

Useful frontend types:

```ts
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
  menu_item_variants?: MenuItemVariant[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string;
  display_order: number;
  is_active: boolean;
  menu_items?: MenuItem[];
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
  workspace_extra_hourly_fee: number;
  workspace_extra_fee_message: string;
};
```

## Variant Display Rules

For a normal item:

```txt
Fraise                    8.5 DT
```

For an item with variants:

```txt
Café aromatisé
Vanille                   5.5 DT
Caramel                   5.5 DT
Noisette                  6 DT
Pistache                  7 DT
```

Do not show an empty parent price for variant items.

## Admin Validation Rules

Recommended frontend validation:

- Category name is required.
- Category image URL can be empty.
- Item name is required.
- Item image URL can be empty.
- If item has no variants, item price is required.
- If item has variants, parent price can be empty.
- Each variant needs a name and price.
- Announcement message is required.
- Business hourly fee must be `>= 0`.

## Important Schema Note

Because image URLs are empty for now, make sure this patch was run:

```sql
alter table public.categories
  drop constraint if exists categories_image_url_not_empty;

alter table public.menu_items
  drop constraint if exists menu_items_image_url_not_empty;
```

Without this, `supabase/seed.sql` will fail.

## Suggested Build Split

Person 1: customer UI

- Public menu page.
- Category navigation.
- Menu item cards/list.
- Variants display.
- Announcements display.
- Workspace fee note.
- Mobile polish.

Person 2: admin UI

- Auth/login.
- Category management.
- Item management.
- Variant management.
- Announcements management.
- Settings page for workspace fee.

The two sides should agree on the TypeScript types early so both UIs stay compatible.
