import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  useSEO({
    title: "CloudPlay BYOG | Host and Connect",
    description: "CloudPlay BYOG lets you host your own game sessions and connect securely via session codes.",
    canonical: "/",
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">CloudPlay BYOG</h1>
          <nav className="flex items-center gap-4">
            <Link to="/login" className="text-sm">Login</Link>
            <Link to="/connect" className="text-sm">Client Connect</Link>
          </nav>
        </div>
      </header>

      <main className="container py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">Bring Your Own GPU. Host and connect in minutes.</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Self‑host sessions, share a secure code, and connect from any device. Powered by Supabase auth and Edge Functions.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild>
            <Link to="/host">Set up a Host</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/connect">Join via Code</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
