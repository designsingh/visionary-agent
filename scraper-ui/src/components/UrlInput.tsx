import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

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
    <div className="space-y-3">
      <div className="relative flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Paste any URL — e.g. https://competitor.com"
            className="w-full rounded-xl border border-border bg-card py-3.5 pl-11 pr-4 text-sm shadow-card placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-card hover:opacity-90 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Crawling...
            </>
          ) : (
            <>
              Grab Pages
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
      {error && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        All data is automatically purged after 10 minutes.
      </p>
    </div>
  );
};

export default UrlInput;
