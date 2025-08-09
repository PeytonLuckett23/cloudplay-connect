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
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { fetch },
      headers: { Authorization: req.headers.get('Authorization') ?? '' },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const body = await req.json().catch(() => ({}));
    const { sessionId } = body as { sessionId?: string };
    if (!sessionId) return json({ error: 'sessionId is required' }, 400);

    const { error } = await sb.from('sessions')
      .update({ status: 'closed' })
      .eq('sessionId', sessionId)
      .eq('ownerId', user.id);
    if (error) return json({ error: error.message }, 400);

    return json({ ok: true });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
