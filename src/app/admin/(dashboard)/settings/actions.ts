"use server";

import { createClient } from "@/lib/supabase/server";

export async function getBusinessSettings() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("business_settings")
    .select("*")
    .eq("id", true)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateBusinessSettings(payload: {
  workspace_extra_hourly_fee: number;
  workspace_extra_fee_message: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("business_settings")
    .update(payload)
    .eq("id", true)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
