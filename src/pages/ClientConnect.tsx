import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSEO } from "@/hooks/useSEO";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ClientConnect = () => {
  useSEO({ title: "Client Connect | CloudPlay BYOG", description: "Join a host using a session code" });

  const [code, setCode] = useState("");
  const [offer, setOffer] = useState("");
  const [answer, setAnswer] = useState("");

  const sendOffer = async () => {
    if (!code || !offer) return toast({ title: "Missing info", description: "Enter code and offer" });
    const { data, error } = await supabase.functions.invoke("sessions-sdp", { body: { code, type: "offer", payload: offer } });
    if (error) return toast({ title: "Failed to send", description: error.message });
    if (data?.answer) setAnswer(data.answer);
    toast({ title: "Offer sent" });
  };

  return (
    <main className="container py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Client Connect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Session Code</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABC123" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer">SDP Offer (optional preview)</Label>
              <Textarea id="offer" value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="Paste your SDP offer here" />
            </div>
            <Button onClick={sendOffer}>Send Offer</Button>
            {answer && (
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea readOnly value={answer} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ClientConnect;
