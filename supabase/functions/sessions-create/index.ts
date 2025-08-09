import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function json(data: unknown, init: number | ResponseInit = 200) {
  const respInit: ResponseInit = typeof init === 'number' ? { status: init } : init;
  return new Response(JSON.stringify(data), {
    ...respInit,
    headers: { "content-type": "application/json", ...(respInit.headers || {}) },
  });
}

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST,OPTIONS' } });
  try {
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { fetch },
      headers: { Authorization: req.headers.get('Authorization') ?? '' },
    });

    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const body = await req.json().catch(() => ({}));

    const code = generateCode();
    const { data, error } = await authClient.from('sessions').insert({ code, host_user_id: user.id, status: 'open' }).select('id, code').single();
    if (error) return json({ error: error.message }, 400);

    return json({ id: data.id, code: data.code }, 200);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function generateCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}
