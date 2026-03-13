import { Globe } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-muted/30 px-4 py-6 sm:px-6">
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Globe className="h-3.5 w-3.5" />
        <span>PageGrab</span>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors">Twitter/X</a>
        <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
      </div>
    </div>
  </footer>
);

export default Footer;
