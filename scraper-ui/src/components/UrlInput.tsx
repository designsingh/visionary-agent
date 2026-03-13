import { useState } from "react";
import { Search, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import WindowChrome from "./WindowChrome";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const EXAMPLE_URLS = [
  "https://example.com",
  "https://stripe.com",
  "https://vercel.com",
];

const UrlInput = ({ onSubmit, isLoading }: UrlInputProps) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a URL to get started.");
      return;
    }
    try {
      const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      setError("");
      onSubmit(parsed.href);
    } catch {
      setError("That doesn't look like a valid URL. Try something like https://example.com");
    }
  };

  return (
    <div className="space-y-4">
      {/* Input vs window: pill label above, input = white + thin border */}
      <div>
        <span className="inline-block font-mono text-[10px] font-medium uppercase tracking-wider text-primary-foreground bg-primary px-2.5 py-1 rounded-full mb-2">
          Target URL
        </span>
        <WindowChrome title="Address">
          <div className="flex items-center gap-1 p-3 bg-[hsl(0_0%_100%)] border-b-2 border-border-muted">
            <button type="button" className="p-1.5 rounded-md border border-border-input hover:bg-muted/50 text-muted-foreground" aria-label="Back">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button type="button" className="p-1.5 rounded-md border border-border-input hover:bg-muted/50 text-muted-foreground" aria-label="Forward">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <div className="flex-1 flex items-center gap-2 px-3 py-2 border-2 border-border-input rounded-lg bg-[hsl(0_0%_100%)] min-w-0">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="https://example.com"
                className="flex-1 min-w-0 py-1 text-sm placeholder:text-muted-foreground focus:outline-none font-mono bg-transparent disabled:opacity-50"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0 border-2 border-border rounded-lg"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Crawling...
                </>
              ) : (
                <>
                  Grab
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>
        </WindowChrome>
      </div>
      {error && (
        <div className="border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Try:</span>
        {EXAMPLE_URLS.map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => { setUrl(u); setError(""); }}
            disabled={isLoading}
            className="font-mono text-xs px-3 py-1.5 border-2 border-border-muted rounded-full bg-card hover:bg-accent/20 hover:border-accent/50 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {new URL(u).hostname}
          </button>
        ))}
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        Data purges in 10 min.
      </p>
    </div>
  );
};

export default UrlInput;
