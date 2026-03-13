import { Layout } from "lucide-react";

const Header = () => {
  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="relative z-20 w-full px-6 py-5 flex justify-between items-center max-w-7xl mx-auto border-b-[3px] border-[var(--text-main)] bg-background">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white window-border flex items-center justify-center shadow-btn rotate-[-3deg] hover:rotate-0 transition-transform cursor-pointer rounded-[var(--radius)]">
          <Layout className="h-5 w-5 text-[var(--text-main)]" strokeWidth={2} />
        </div>
        <span className="font-bold text-2xl tracking-tight text-[var(--text-main)]">PageGrab</span>
      </div>
      <button
        onClick={scrollToHowItWorks}
        className="font-bold hover:underline flex items-center gap-2 px-4 py-2 window-border bg-white shadow-btn hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all text-sm rounded-[var(--radius)]"
      >
        How it works
        <span className="text-[var(--text-main)]" aria-hidden>→</span>
      </button>
    </nav>
  );
};

export default Header;
