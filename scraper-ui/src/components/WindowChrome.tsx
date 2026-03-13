interface WindowChromeProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  variant?: "orange" | "pink";
}

/** 90s-style window frame: colored title bar, traffic light buttons */
const WindowChrome = ({ title, children, className = "", variant = "orange" }: WindowChromeProps) => (
  <div className={`border-2 border-border bg-card shadow-card overflow-hidden rounded-lg ${className}`}>
    {/* Title bar — orange or pink, macOS-style traffic lights */}
    <div className={`flex items-center justify-between border-b-2 border-border px-2 py-1.5 ${variant === "pink" ? "bg-title-bar-pink" : "bg-[hsl(var(--title-bar))]"}`}>
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-3.5 h-3.5 rounded-full bg-[#FF5F57] border border-[rgba(0,0,0,0.15)] flex items-center justify-center" title="Close" />
          <span className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[rgba(0,0,0,0.15)] flex items-center justify-center" title="Minimize" />
          <span className="w-3.5 h-3.5 rounded-full bg-[#28CA42] border border-[rgba(0,0,0,0.15)] flex items-center justify-center" title="Maximize" />
        </div>
        <span className="font-mono text-[11px] text-white truncate ml-2 font-medium">{title}</span>
      </div>
    </div>
    {children}
  </div>
);

export default WindowChrome;
