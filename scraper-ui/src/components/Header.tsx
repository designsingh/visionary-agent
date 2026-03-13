import { Globe } from "lucide-react";

const Header = () => {
  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="border-b border-border bg-card px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Globe className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">PageGrab</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/visionary" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Visionary
          </a>
          <button
            onClick={scrollToHowItWorks}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            How it works
          </button>
          <span className="hidden sm:inline rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Free during beta
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
