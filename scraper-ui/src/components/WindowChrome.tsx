interface WindowChromeProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  variant?: "orange" | "pink";
}

/** Variant-style window: 3px border, hard shadow, title bar with traffic lights */
const WindowChrome = ({ title, children, className = "", variant = "orange" }: WindowChromeProps) => (
  <div className={`window-border rounded-[var(--radius)] overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-window-hover ${variant === "pink" ? "bg-[hsl(var(--title-bar-pink))]" : "bg-[hsl(var(--title-bar))]"} shadow-window ${className}`}>
    <div className="border-b-[3px] border-[var(--text-main)] px-4 py-3 flex items-center justify-between bg-white/40 backdrop-blur-sm">
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex gap-2 shrink-0">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-[var(--text-main)] bg-[var(--traffic-red)]" title="Close" />
          <span className="w-3.5 h-3.5 rounded-full border-2 border-[var(--text-main)] bg-[var(--traffic-yellow)]" title="Minimize" />
          <span className="w-3.5 h-3.5 rounded-full border-2 border-[var(--text-main)] bg-[var(--traffic-green)]" title="Maximize" />
        </div>
        <div className="flex-1 flex justify-center min-w-0">
          <div className="h-1.5 w-20 border-y-2 border-[var(--text-main)] opacity-30 hidden sm:block" />
        </div>
        <span className="font-mono text-xs font-bold text-[var(--text-main)] truncate ml-2 opacity-90">{title}</span>
      </div>
    </div>
    {children}
  </div>
);

export default WindowChrome;
