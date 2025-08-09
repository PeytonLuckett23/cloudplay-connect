import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthProvider";
import { getSupabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "react-router-dom";

interface SessionRow { id: string; code: string; status: string; created_at: string }

const Dashboard = () => {
  useSEO({ title: "Dashboard | CloudPlay BYOG", description: "View your hosts and active sessions" });
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionRow[]>([]);

  useEffect(() => {
    if (!user) return;
    const sb = getSupabase();
    if (!sb) return;
    sb.from("sessions").select("id, code, status, created_at").eq("host_user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setSessions(data || []));
  }, [user]);

  return (
    <main className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button asChild><Link to="/host">New Session</Link></Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Session {s.code}</span>
                <span className="text-xs text-muted-foreground uppercase">{s.status}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Created {new Date(s.created_at).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
        {sessions.length === 0 && (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">No sessions yet. Create one from Host Setup.</CardContent>
          </Card>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
