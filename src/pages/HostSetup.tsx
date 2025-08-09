import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { getSupabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";

const HostSetup = () => {
  useSEO({ title: "Host Setup | CloudPlay BYOG", description: "Create a session and share the code" });
  const [latest, setLatest] = useState<string>("");

  const loadLatest = async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const { data } = await sb
      .from("sessions")
      .select("sessionId, createdAt")
      .eq("ownerId", user.id)
      .eq("status", "active")
      .order("createdAt", { ascending: false })
      .limit(1);
    setLatest(data?.[0]?.sessionId || "");
  };

  useEffect(() => { loadLatest(); }, []);

  const createSession = async () => {
    const sb = getSupabase();
    if (!sb) return toast({ title: "Supabase not configured", description: "Connect via the green Supabase button." });
    const { data, error } = await sb.functions.invoke("createSession", { body: {} });
    if (error) return toast({ title: "Failed to create session", description: error.message });
    setLatest(data.sessionId);
    try { await navigator.clipboard.writeText(data.sessionId); } catch {}
  };

  const closeSession = async () => {
    if (!latest) return;
    const sb = getSupabase();
    if (!sb) return toast({ title: "Supabase not configured" });
    const { error } = await sb.functions.invoke("closeSession", { body: { sessionId: latest } });
    if (error) return toast({ title: "Failed to close", description: error.message });
    setLatest("");
  };

  const copy = async () => { if (latest) try { await navigator.clipboard.writeText(latest); } catch {} };

  return (
    <main className="container py-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Host Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Run the Host App on your gaming PC. Use this session code in the Host App to connect.</p>
            <Button size="lg" onClick={createSession}>Create Session</Button>
            {latest && (
              <div className="space-y-2">
                <Label>Latest Session ID</Label>
                <div className="flex gap-2">
                  <Input readOnly value={latest} />
                  <Button variant="outline" onClick={copy}>Copy</Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {latest && <Button variant="destructive" onClick={closeSession}>Close Session</Button>}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <ol>
              <li>Run the Host App on your gaming PC.</li>
              <li>Press Create Session to generate a session ID.</li>
              <li>In the Host App, paste the session ID to connect.</li>
              <li>Share the session ID with your client device.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default HostSetup;
