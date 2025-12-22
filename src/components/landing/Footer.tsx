import { Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-gradient-card py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <span className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">meetme</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 meetme. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <Instagram className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            <Linkedin className="h-6 w-6 text-muted-foreground hover:text-secondary cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
}
