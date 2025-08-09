import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { getSupabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";

const HostSetup = () => {
  useSEO({ title: "Host Setup | CloudPlay BYOG", description: "Create a session and share the code" });
  const [code, setCode] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const createSession = async () => {
    const sb = getSupabase();
    if (!sb) return toast({ title: "Supabase not configured", description: "Connect via the green Supabase button." });
    const { data, error } = await sb.functions.invoke("sessions-create", { body: {} });
    if (error) return toast({ title: "Failed to create session", description: error.message });
    setCode(data.code);
    setSessionId(data.id);
    toast({ title: "Session created", description: `Code ${data.code} copied` });
    try {
      await navigator.clipboard.writeText(data.code);
    } catch {}
  };

  const closeSession = async () => {
    if (!sessionId && !code) return;
    const sb = getSupabase();
    if (!sb) return toast({ title: "Supabase not configured" });
    const { error } = await sb.functions.invoke("sessions-close", { body: { id: sessionId, code } });
    if (error) return toast({ title: "Failed to close", description: error.message });
    toast({ title: "Session closed" });
  };

  return (
    <main className="container py-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Host Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Create a session to receive a one‑time connection code. Share it with your client device to connect.</p>
            <Button onClick={createSession}>Create Session</Button>
            {code && (
              <div className="space-y-2">
                <Label>Session Code</Label>
                <Input readOnly value={code} />
              </div>
            )}
          </CardContent>
          <CardFooter>
            {code && <Button variant="destructive" onClick={closeSession}>Close Session</Button>}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <ol>
              <li>Install your game host and ensure network access.</li>
              <li>Create a session to generate a code.</li>
              <li>On the client device, open Client Connect and paste the code.</li>
              <li>Accept the connection request on the host when prompted.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default HostSetup;
