import { useState, useEffect, useRef } from "react";
import WindowChrome from "./WindowChrome";

const LOG_LINES = [
  "→ stripe.com: grabbed. No ransom note.",
  "→ /pricing never saw it coming — vercel.com",
  "→ linear.app acquired (the page, not the company)",
  "→ notion.so: pages liberated from their database",
  "→ tailwindcss.com /about — styles captured, designers safe",
  "→ Screenshot of figma.com. They cooperated.",
  "→ github.com: read the repo. Didn't touch the code.",
  "→ /docs grabbed before it could run — raycast.com",
  "→ resend.com: page captured, emails left alone",
  "→ arc.net: tab acquired. Browser still at large.",
  "→ planetscale.com: scale captured. Database unmoved.",
  "→ supabase.com: grabbed the landing page. That's it.",
  "→ Vercel never had a chance",
  "→ Another one in the bag — stripe.com",
  "→ /blog politely captured — planetscale.com",
  "→ Markdown extracted. Patient survived.",
  "→ HTML liberated from notion.so",
  "→ figma.com: screenshot acquired. Design preserved.",
  "⚠ System error. Just kidding. Page grabbed.",
];

const HomepageActivityFeed = () => {
  const [lines, setLines] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    // Seed initial lines
    const initial = LOG_LINES.slice(0, 4).map((text, i) => ({ id: i, text }));
    setLines(initial);
    idRef.current = 4;

    const interval = setInterval(() => {
      const text = LOG_LINES[Math.floor(Math.random() * LOG_LINES.length)];
      const id = idRef.current++;
      setLines((prev) => [...prev.slice(-9), { id, text }]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <WindowChrome title="Activity Log" variant="pink">
      <div className="flex items-center gap-2 border-b border-border-muted px-3 py-2 bg-muted/30">
        <span className="h-1.5 w-1.5 rounded-full bg-sticker animate-pulse" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Live</span>
      </div>
      <div className="max-h-36 min-h-[7rem] overflow-y-auto p-3 font-mono text-xs bg-[hsl(0_0%_100%)]">
        <div className="space-y-0.5">
          {lines.map((line, i) => (
            <div
              key={line.id}
              className={`text-muted-foreground ${i === lines.length - 1 ? "animate-fade-in-up" : ""}`}
            >
              {line.text}
            </div>
          ))}
          <div className="inline-flex items-center gap-0.5 mt-0.5 text-sticker">
            <span className="animate-pulse">▋</span>
          </div>
        </div>
      </div>
    </WindowChrome>
  );
};

export default HomepageActivityFeed;
