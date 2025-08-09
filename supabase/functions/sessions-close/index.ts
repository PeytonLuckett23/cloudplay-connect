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

    const match = body.id ? { id: body.id } : (body.code ? { code: body.code } : null);
    if (!match) return json({ error: 'Missing id or code' }, 400);

    const { error } = await authClient.from('sessions').update({ status: 'closed' }).match({ ...match, host_user_id: user.id });
    if (error) return json({ error: error.message }, 400);

    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
