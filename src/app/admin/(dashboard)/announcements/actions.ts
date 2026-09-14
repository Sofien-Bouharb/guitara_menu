"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAnnouncements() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createAnnouncement(payload: {
  title: string | null;
  message: string;
  variant: "info" | "promo" | "warning" | "success";
  placement: "banner" | "popup";
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  display_order: number;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("announcements")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateAnnouncement(
  id: string,
  payload: {
    title: string | null;
    message: string;
    variant: "info" | "promo" | "warning" | "success";
    placement: "banner" | "popup";
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
    display_order: number;
  },
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("announcements")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("announcements").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function toggleAnnouncementActive(id: string, isActive: boolean) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("announcements")
    .update({ is_active: isActive })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
