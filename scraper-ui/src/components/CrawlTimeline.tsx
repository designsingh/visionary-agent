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
      <div className="flex items-center gap-2 border-b border-border-muted px-3 py-2 bg-muted/30">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
      </div>

      {/* Terminal accent — light panel, mono log lines */}
      <div
        ref={scrollRef}
        className="max-h-48 overflow-y-auto p-4 font-mono text-xs bg-muted/30 min-h-[8rem]"
      >
        <div className="space-y-0.5 text-muted-foreground">
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
                className="animate-fade-in-up text-foreground/90"
                style={{ animationDelay: `${Math.min(i, 5) * 50}ms` }}
              >
                → <span className="text-primary">{path}</span>
                {u.title && (
                  <span className="text-muted-foreground ml-1 truncate max-w-[180px] inline-block align-bottom" title={u.title}>
                    {u.title}
                  </span>
                )}
              </div>
            );
          })}

          {extracting && foundUrls.length > 0 && (
            <div className="pt-1 text-muted-foreground">→ Extracting…</div>
          )}

          {!extracting && foundUrls.length === 0 && (
            <div className="animate-pulse">→ Discovering…</div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden bg-muted/50">
        <div
          className="h-full bg-primary/80 transition-all duration-500 ease-out"
          style={{
            width: extracting ? "100%" : foundUrls.length > 0 ? `${Math.min(70 + foundUrls.length * 2, 95)}%` : "30%",
          }}
        />
      </div>
    </WindowChrome>
  );
};

export default CrawlTimeline;
