import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  if (!url || !anon) {
    console.error("Supabase env vars missing. Ensure your project is connected to Supabase and environment variables are available.");
    return null;
  }
  if (!client) client = createClient(url, anon);
  return client;
};
