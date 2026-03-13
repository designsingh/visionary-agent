import { useState, useEffect } from "react";
import { Loader2, ExternalLink } from "lucide-react";

const CRAWL_MESSAGES = [
  "Discovering pages…",
  "Following links…",
  "Indexing {domain}…",
  "More pages found…",
  "Almost done…",
];

const EXTRACT_MESSAGES = [
  "Capturing screenshots…",
  "Converting to markdown…",
  "Exporting HTML…",
  "Preparing files…",
  "Almost ready…",
];

interface FoundUrl { url: string; title?: string }

const CrawlLoader = ({ domain, foundUrls = [], extracting = false }: { domain: string; foundUrls?: FoundUrl[]; extracting?: boolean }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const rawMessages = extracting ? EXTRACT_MESSAGES : CRAWL_MESSAGES;
  const messages = rawMessages.map((m) => m.replace("{domain}", domain));

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="border border-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-3">
        <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {extracting ? "Extracting" : "Crawling"} <span className="text-primary font-mono">{domain}</span>
          </p>
          <p className="font-mono text-xs text-muted-foreground mt-1">{messages[messageIndex]}</p>
        </div>
      </div>
      {!extracting && foundUrls.length > 0 && (
        <div className="mt-4 max-h-32 overflow-y-auto border border-border bg-muted/30 px-3 py-2">
          <p className="font-mono text-xs text-muted-foreground mb-1.5">{foundUrls.length} pages found</p>
          <ul className="space-y-1 font-mono text-xs">
            {foundUrls.slice(-8).reverse().map((u, i) => {
              let display = u.title;
              if (!display) {
                try {
                  display = new URL(u.url).pathname || u.url;
                } catch {
                  display = u.url;
                }
              }
              return (
                <li key={`${u.url}-${i}`} className="truncate flex items-center gap-1">
                  <ExternalLink className="h-3 w-3 shrink-0 text-primary/70" />
                  <span title={u.url}>{display}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div className="mt-4 h-1 w-full overflow-hidden bg-muted">
        <div className="h-full bg-primary/70 animate-shimmer" style={{ width: !extracting && foundUrls.length > 0 ? "85%" : "70%" }} />
      </div>
    </div>
  );
};

export default CrawlLoader;
