import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import WindowChrome from "./WindowChrome";

interface CrawlTimelineProps {
  domain: string;
  foundUrls: { url: string; title?: string }[];
  extracting?: boolean;
}

const CrawlTimeline = ({ domain, foundUrls, extracting }: CrawlTimelineProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const displayUrls = foundUrls.slice(-20);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [foundUrls]);

  return (
    <WindowChrome title={`${extracting ? "Extracting" : "Crawling"} — ${domain}`}>
      <div className="flex items-center gap-2 border-b-2 border-[var(--text-main)]/20 px-3 py-2 bg-white/40">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--text-main)] shrink-0" />
      </div>

      <div
        ref={scrollRef}
        className="max-h-48 overflow-y-auto p-4 font-mono text-xs bg-white/50 min-h-[8rem]"
      >
        <div className="space-y-0.5 text-[var(--text-main)] opacity-90">
          <div>$ pagegrab {domain}</div>
          <div>→ Starting crawl…</div>

          {displayUrls.map((u, i) => {
            let path = u.url;
            try {
              const parsed = new URL(u.url);
              path = parsed.pathname || "/";
            } catch {}
            return (
              <div
                key={`${u.url}-${i}`}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i, 5) * 50}ms` }}
              >
                → <span className="text-[var(--traffic-green)] font-medium">{path}</span>
                {u.title && (
                  <span className="opacity-80 ml-1 truncate max-w-[180px] inline-block align-bottom" title={u.title}>
                    {u.title}
                  </span>
                )}
              </div>
            );
          })}

          {extracting && foundUrls.length > 0 && (
            <div className="pt-1 opacity-80">→ Extracting…</div>
          )}

          {!extracting && foundUrls.length === 0 && (
            <div className="animate-pulse">→ Discovering…</div>
          )}
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden bg-[var(--text-main)]/10">
        <div
          className="h-full bg-[var(--traffic-green)] transition-all duration-500 ease-out"
          style={{
            width: extracting ? "100%" : foundUrls.length > 0 ? `${Math.min(70 + foundUrls.length * 2, 95)}%` : "30%",
          }}
        />
      </div>
    </WindowChrome>
  );
};

export default CrawlTimeline;
