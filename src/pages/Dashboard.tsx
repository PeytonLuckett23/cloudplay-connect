import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthProvider";
import { getSupabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "react-router-dom";

interface SessionRow { id: string; sessionId: string; status: string; createdAt: string }

const Dashboard = () => {
  useSEO({ title: "Dashboard | CloudPlay BYOG", description: "View your hosts and active sessions" });
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const sb = getSupabase();
    if (!sb || !user) return;
    const { data } = await sb.from("sessions").select("id, sessionId, status, createdAt").eq("ownerId", user.id).eq("status", "active").order("createdAt", { ascending: false });
    setSessions(data || []);
  };

  useEffect(() => { load(); }, [user]);

  const createNew = async () => {
    setCreating(true);
    try {
      const sb = getSupabase();
      if (!sb) return;
      const { data, error } = await sb.functions.invoke("createSession", { body: {} });
      if (error) throw error;
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const copy = async (code: string) => {
    try { await navigator.clipboard.writeText(code); } catch {}
  };

  return (
    <main className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          <Button size="lg" onClick={createNew} disabled={creating}>Create New Session</Button>
          <Button asChild variant="secondary" size="lg"><Link to="/host">Host Setup</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Session {s.sessionId}</span>
                <span className="text-xs text-muted-foreground uppercase">{s.status}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Created {new Date(s.createdAt).toLocaleString()}</p>
              <div className="mt-4">
                <Button size="sm" variant="outline" onClick={() => copy(s.sessionId)}>Copy Session ID</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {sessions.length === 0 && (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">No active sessions. Create one to get started.</CardContent>
          </Card>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
