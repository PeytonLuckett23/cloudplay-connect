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
    // Optional: allow unauthenticated clients to send SDP by code only. For now, we accept both.

    const body = await req.json().catch(() => ({}));
    const { code, type, payload } = body as { code: string; type: 'offer'|'answer'|'candidate'; payload: string };
    if (!code || !type || !payload) return json({ error: 'Missing code/type/payload' }, 400);

    const { data: sessionRow } = await authClient.from('sessions').select('id, status').eq('code', code).maybeSingle();
    if (!sessionRow) return json({ error: 'Session not found' }, 404);
    if (sessionRow.status === 'closed') return json({ error: 'Session closed' }, 400);

    const { error } = await authClient.from('session_signals').insert({ session_id: sessionRow.id, type, payload, created_by: user?.id ?? null });
    if (error) return json({ error: error.message }, 400);

    return json({ ok: true });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
