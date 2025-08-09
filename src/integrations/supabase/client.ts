import { createClient } from "@supabase/supabase-js";

// Temporary client. If the Lovable Supabase integration generates this file later,
// it will replace this implementation. Do not modify in place once generated.
const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const supabase = createClient(url, anon);
