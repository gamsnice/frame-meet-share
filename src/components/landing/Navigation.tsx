import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold bg-gradient-accent bg-clip-text text-transparent">meetme</span>
            <span className="hidden md:inline text-xs text-muted-foreground/60">|</span>
            <span className="hidden md:inline text-xs text-muted-foreground">Visual Creator for Event Marketing</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/admin/login")} className="hover:bg-muted">
              Login
            </Button>
            <Button
              onClick={() => navigate("/admin/register")}
              className="bg-gradient-accent text-primary-foreground hover:opacity-90"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
