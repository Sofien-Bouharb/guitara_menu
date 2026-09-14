"use server";

import { createClient } from "@/lib/supabase/server";

export async function getItems() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("menu_items")
    .select(
      `
      *,
      menu_item_variants (*)
    `,
    )
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createItem(payload: {
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  image_url: string;
  has_variants: boolean;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("menu_items")
    .insert(payload)
    .select(
      `
      *,
      menu_item_variants (*)
    `,
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateItem(
  id: string,
  payload: {
    category_id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number | null;
    image_url: string;
    has_variants: boolean;
    is_available: boolean;
    is_featured: boolean;
    display_order: number;
  },
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("menu_items")
    .update(payload)
    .eq("id", id)
    .select(
      `
      *,
      menu_item_variants (*)
    `,
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteItem(id: string) {
  const supabase = await createClient();

  const { error: variantsError } = await supabase
    .from("menu_item_variants")
    .delete()
    .eq("item_id", id);

  if (variantsError) {
    throw new Error(variantsError.message);
  }

  const { error: itemError } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", id);

  if (itemError) {
    throw new Error(itemError.message);
  }

  return { success: true };
}

export async function toggleItemAvailability(id: string, isAvailable: boolean) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("menu_items")
    .update({ is_available: isAvailable })
    .eq("id", id)
    .select(
      `
      *,
      menu_item_variants (*)
    `,
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createVariant(payload: {
  item_id: string;
  name: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  display_order: number;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("menu_item_variants")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateVariant(
  id: string,
  payload: {
    name: string;
    price: number;
    image_url: string | null;
    is_available: boolean;
    display_order: number;
  },
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("menu_item_variants")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteVariant(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("menu_item_variants")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
