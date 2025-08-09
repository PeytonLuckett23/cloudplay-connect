import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSEO } from "@/hooks/useSEO";
import { toast } from "@/hooks/use-toast";

const ClientConnect = () => {
  useSEO({ title: "Client Connect | CloudPlay BYOG", description: "Join a host using a session code" });

  const [sessionId, setSessionId] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const join = () => {
    if (!sessionId) return toast({ title: "Enter a session ID" });
    try {
      const ws = new WebSocket("ws://localhost:8080/ws");
      wsRef.current = ws;
      ws.onopen = () => {
        ws.send(JSON.stringify({ join: sessionId }));
        setLog((l) => ["Connected to signaling server", ...l]);
      };
      ws.onmessage = (e) => setLog((l) => ["<- " + e.data, ...l]);
      ws.onclose = () => setLog((l) => ["Disconnected", ...l]);
      ws.onerror = () => setLog((l) => ["WebSocket error", ...l]);
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to connect" });
    }
  };

  useEffect(() => () => { wsRef.current?.close(); }, []);

  return (
    <main className="container py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Client Connect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Session ID</Label>
              <div className="flex gap-2">
                <Input id="code" value={sessionId} onChange={(e) => setSessionId(e.target.value.toUpperCase())} placeholder="ABC123" />
                <Button size="lg" onClick={join}>Join</Button>
              </div>
            </div>

            <div className="aspect-video bg-muted rounded-md overflow-hidden">
              <video id="remoteVideo" className="w-full h-full" autoPlay playsInline />
            </div>

            <div>
              <Label>Signaling Log</Label>
              <Textarea readOnly value={log.join("\n")} className="min-h-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ClientConnect;
