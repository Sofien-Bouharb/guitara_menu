"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardData() {
  const supabase = await createClient();

  const [categoriesResult, itemsResult, announcementsResult, settingsResult] =
    await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true }),

      supabase
        .from("menu_items")
        .select(
          `
        *,
        categories (
          name
        )
      `,
        )
        .order("display_order", { ascending: true }),

      supabase
        .from("announcements")
        .select("*")
        .order("display_order", { ascending: true }),

      supabase.from("business_settings").select("*").eq("id", true).single(),
    ]);

  if (categoriesResult.error) {
    throw new Error(categoriesResult.error.message);
  }

  if (itemsResult.error) {
    throw new Error(itemsResult.error.message);
  }

  if (announcementsResult.error) {
    throw new Error(announcementsResult.error.message);
  }

  if (settingsResult.error) {
    throw new Error(settingsResult.error.message);
  }

  return {
    categories: categoriesResult.data,
    items: itemsResult.data,
    announcements: announcementsResult.data,
    settings: settingsResult.data,
  };
}

export async function toggleDashboardItemAvailability(
  id: string,
  isAvailable: boolean,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("menu_items")
    .update({
      is_available: isAvailable,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
