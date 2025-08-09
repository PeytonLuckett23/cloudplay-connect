# CloudPlay BYOG

CloudPlay BYOG (Bring Your Own GPU) lets you self‑host game/desktop sessions, share a short session ID, and connect from any device.

## 1) Supabase Setup
1. Create a new Supabase project (or use the one already connected via Lovable’s green Supabase button).
2. Ensure the Lovable integration is connected so the frontend gets env vars automatically.
3. Run the SQL below in the Supabase SQL Editor to create tables and policies.

```sql
-- Users (profile mirror of auth users)
create table if not exists public.users (
  id uuid primary key,
  email text,
  createdAt timestamp with time zone default now(),
  updatedAt timestamp with time zone default now()
);

-- Sessions
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  sessionId text unique not null,
  ownerId uuid not null references public.users(id) on delete cascade,
  status text not null default 'active',
  createdAt timestamp with time zone default now(),
  updatedAt timestamp with time zone default now()
);

-- Session signals
create table if not exists public.sessionSignals (
  id uuid primary key default gen_random_uuid(),
  sessionId uuid not null references public.sessions(id) on delete cascade,
  type text not null, -- 'offer' | 'answer' | 'ice'
  data jsonb not null,
  createdAt timestamp with time zone default now()
);

-- RLS
alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.sessionSignals enable row level security;

-- Users: each user manages their own row
create policy "users_self" on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Sessions: owners manage their sessions
create policy "sessions_owner_read" on public.sessions for select using (auth.uid() = ownerId);
create policy "sessions_owner_write" on public.sessions for all using (auth.uid() = ownerId) with check (auth.uid() = ownerId);

-- Signals: allow insert/select (adjust as you tighten security)
create policy "signals_insert_any" on public.sessionSignals for insert with check (true);
create policy "signals_select_any" on public.sessionSignals for select using (true);
```

Note: Edge Functions upsert your user row automatically on first session creation.

## 2) Local Development
```bash
npm install
npm run dev
```
Open http://localhost:5173

## 3) Edge Functions
Deployed automatically by Lovable:
- createSession: generates a 6‑char sessionId and inserts a new active session
- closeSession: sets status = "closed" for a given sessionId
- storeSignal: stores { type, data } for a session

All functions use Supabase auth and the project env vars via the Lovable integration.

## 4) WebSocket Signaling Server (local testing)
Example Node server listening at ws://localhost:8080/ws that relays messages within the same room (sessionId):

```bash
npm i ws
```

server.js:
```js
import { WebSocketServer } from 'ws';
const wss = new WebSocketServer({ port: 8080 });
const rooms = new Map(); // sessionId -> Set(ws)

wss.on('connection', (ws, req) => {
  let room = null;

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      if (data.join) {
        if (req.url !== '/ws') return ws.close();
        room = String(data.join).toUpperCase();
        if (!rooms.has(room)) rooms.set(room, new Set());
        rooms.get(room).add(ws);
        return;
      }
      if (room) {
        for (const client of rooms.get(room)) {
          if (client !== ws && client.readyState === 1) client.send(JSON.stringify(data));
        }
      }
    } catch {}
  });

  ws.on('close', () => {
    if (room && rooms.has(room)) rooms.get(room).delete(ws);
  });
});

console.log('WS signaling on ws://localhost:8080/ws');
```

Client example (inside the app’s Client Connect page):
```js
const ws = new WebSocket('ws://localhost:8080/ws');
ws.onopen = () => ws.send(JSON.stringify({ join: 'ABC123' }));
ws.onmessage = (e) => console.log('signal:', e.data);
```

## 5) UI/UX
- Mobile‑friendly layout with large buttons
- Light mode by default

## 6) Export to GitHub / Deploy
- Connect GitHub via Lovable → GitHub
- Publish from Lovable when ready
