import { Crosshair } from "lucide-react";

const Header = () => {
  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="relative z-20 border-b-2 border-border bg-card px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-border bg-primary/10">
            <Crosshair className="h-4 w-4 text-primary" strokeWidth={2} />
          </div>
          <span className="font-semibold text-base tracking-tight text-foreground">PageGrab</span>
        </div>
        <button
          onClick={scrollToHowItWorks}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          How it works
        </button>
      </div>
    </header>
  );
};

export default Header;
