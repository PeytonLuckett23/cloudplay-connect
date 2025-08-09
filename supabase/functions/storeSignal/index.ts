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

    const body = await req.json().catch(() => ({}));
    const { sessionId, type, data } = body as { sessionId?: string; type?: string; data?: unknown };
    if (!sessionId || !type || !data) return json({ error: 'sessionId, type, and data are required' }, 400);

    // Lookup session by sessionId text to get UUID
    const { data: session } = await sb.from('sessions').select('id, status').eq('sessionId', sessionId).maybeSingle();
    if (!session) return json({ error: 'Session not found' }, 404);
    if (session.status === 'closed') return json({ error: 'Session closed' }, 400);

    const { error } = await sb.from('sessionSignals').insert({ sessionId: session.id, type, data });
    if (error) return json({ error: error.message }, 400);

    return json({ ok: true });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
