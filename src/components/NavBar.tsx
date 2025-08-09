import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";

export const NavBar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const linkCls = (path: string) =>
    `text-sm px-2 py-1 rounded ${isActive(path) ? "text-primary" : "text-foreground/80 hover:text-foreground"}`;

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold">CloudPlay BYOG</Link>
        <nav className="flex items-center gap-3">
          <Link to="/connect" className={linkCls("/connect")}>Connect</Link>
          {user && <Link to="/host" className={linkCls("/host")}>Host</Link>}
          {user && <Link to="/dashboard" className={linkCls("/dashboard")}>Dashboard</Link>}
          {!user ? (
            <Button asChild size="sm"><Link to="/login">Login</Link></Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={signOut}>Sign out</Button>
          )}
          <a href="https://docs.lovable.dev/user-guides/deployment" target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline">Deploy</Button>
          </a>
          <a href="https://docs.lovable.dev/integrations/github" target="_blank" rel="noreferrer" className="text-sm">
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
};
