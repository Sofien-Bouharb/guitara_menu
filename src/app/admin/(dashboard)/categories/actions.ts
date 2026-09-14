"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createCategory(payload: {
  name: string;
  slug: string;
  description: string | null;
  image_url: string;
  display_order: number;
  is_active: boolean;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateCategory(
  id: string,
  payload: {
    name: string;
    slug: string;
    description: string | null;
    image_url: string;
    display_order: number;
    is_active: boolean;
  },
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function toggleCategoryActive(id: string, isActive: boolean) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .update({ is_active: isActive })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
