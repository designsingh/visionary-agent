import { Layout } from "lucide-react";

const Header = () => (
  <nav className="relative z-20 w-full px-6 py-5 flex justify-between items-center max-w-7xl mx-auto bg-background">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-white window-border flex items-center justify-center shadow-btn rotate-[-3deg] hover:rotate-0 transition-transform cursor-pointer rounded-[var(--radius)]">
        <Layout className="h-5 w-5 text-[var(--text-main)]" strokeWidth={2} />
      </div>
      <span className="font-bold text-2xl tracking-tight text-[var(--text-main)]">PageGrab</span>
    </div>
  </nav>
);

export default Header;
