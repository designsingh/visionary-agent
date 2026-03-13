import { useEffect, useRef } from "react";
import WindowChrome from "./WindowChrome";

interface CrawlTimelineProps {
  domain: string;
  foundUrls: { url: string; title?: string }[];
  extracting?: boolean;
  extractingTotal?: number;
}

const CrawlTimeline = ({ domain, foundUrls, extracting, extractingTotal = 0 }: CrawlTimelineProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const displayUrls = foundUrls.slice(-20);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [foundUrls]);

  const percentComplete = extracting
    ? 100
    : foundUrls.length > 0
      ? Math.min(70 + foundUrls.length * 2, 95)
      : 30;

  const totalSize = "—"; // We don't have size from API; design shows "2.4 MB Total Size"

  return (
    <div className="space-y-6">
      {/* Variant design: status bar — white box with progress-bar-container */}
      <div className="w-full window-border window-shadow bg-white p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 w-full">
          <div className="flex justify-between items-end mb-2">
            <div className="flex flex-col">
              <span className="font-bold text-xs uppercase tracking-widest opacity-60 text-[var(--text-main)]">Status</span>
              <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-main)]">
                {extracting ? "Extracting" : "Crawling"}{" "}
                <span className="font-mono text-[var(--btn-bg)]">{domain}</span>
              </h2>
            </div>
            <span className="font-mono font-bold text-lg text-[var(--text-main)]">{extracting ? 100 : percentComplete}% Complete</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${extracting ? 100 : percentComplete}%` }} />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-4">
            <div className="text-2xl font-bold text-[var(--text-main)]">{foundUrls.length}</div>
            <div className="text-[10px] font-bold uppercase opacity-60 text-[var(--text-main)]">Pages Found</div>
          </div>
          <div className="text-center px-4 border-l-2 border-[var(--text-main)]/10">
            <div className="text-2xl font-bold text-[var(--text-main)]">{totalSize}</div>
            <div className="text-[10px] font-bold uppercase opacity-60 text-[var(--text-main)]">Total Size</div>
          </div>
        </div>
      </div>

      <WindowChrome title={`${extracting ? "Extracting" : "Crawling"} — ${domain}`}>
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

      </WindowChrome>
    </div>
  );
};

export default CrawlTimeline;
