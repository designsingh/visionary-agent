import { useState, useEffect } from "react";
import { Loader2, ExternalLink } from "lucide-react";

const CRAWL_MESSAGES = [
  "Dispatching tiny minions to dig through the site…",
  "Minions are burrowing into the homepage…",
  "They've found the links — sending more minions after them…",
  "Minion #7 just grabbed the About page…",
  "Digging, digging… they really love to dig…",
  "One minion is taking screenshots. The others are jealous…",
  "They're bringing back pages in their little baskets…",
  "Minion spotted in /pricing. Reinforcements inbound…",
  "Converting their loot into markdown and HTML…",
  "Almost done — minions are dusting themselves off…",
  "They keep finding more pages. Overachievers…",
  "A minion fell in the footer. We're sending a rescue…",
  "The minions made a human pyramid to reach the nav…",
  "Boss, they're coming back with the goods…",
  "Last minion is climbing out of the contact form…",
];

const EXTRACT_MESSAGES = [
  "Wrapping each page in a tidy little bundle…",
  "Taking full-page screenshots (the minions love the camera)…",
  "Converting everything to clean markdown…",
  "Exporting HTML with all the bells and whistles…",
  "One more page… almost there…",
  "Double-checking the files before handoff…",
  "The minions are doing quality control…",
  "Packaging your files for download…",
  "Making sure nothing gets left behind…",
  "Final polish on the export…",
  "Gathering screenshots from the field…",
  "Formatting markdown, one page at a time…",
  "Almost ready — just tidying up…",
];

interface FoundUrl { url: string; title?: string }

const CrawlLoader = ({ domain, foundUrls = [], extracting = false }: { domain: string; foundUrls?: FoundUrl[]; extracting?: boolean }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = extracting ? EXTRACT_MESSAGES : CRAWL_MESSAGES;

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {extracting ? "Extracting" : "Crawling"} <span className="text-primary">{domain}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">{messages[messageIndex]}</p>
        </div>
      </div>
      {!extracting && foundUrls.length > 0 && (
        <div className="mt-4 max-h-32 overflow-y-auto rounded-lg border border-border bg-muted/30 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">{foundUrls.length} page{foundUrls.length !== 1 ? "s" : ""} found so far</p>
          <ul className="space-y-1 text-xs">
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
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary/60 animate-shimmer" style={{ width: !extracting && foundUrls.length > 0 ? "85%" : "70%" }} />
      </div>
    </div>
  );
};

export default CrawlLoader;
