import { useState, useEffect, useRef } from "react";
import { Globe, Camera } from "lucide-react";
import { Turnstile } from "react-turnstile";
import WindowChrome from "./WindowChrome";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";

interface UrlInputProps {
  onSubmit: (url: string, turnstileToken?: string) => void;
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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requireTurnstile = !!TURNSTILE_SITE_KEY;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a URL to get started.");
      return;
    }
    if (requireTurnstile && !turnstileToken) {
      setError("Please complete the security check below.");
      return;
    }
    try {
      const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      setError("");
      onSubmit(parsed.href, turnstileToken ?? undefined);
    } catch {
      setError("That doesn't look like a valid URL. Try something like https://example.com");
    }
  };

  return (
    <div className="space-y-6">
      <WindowChrome title="Capture_v2.exe">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center window-border bg-white overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] focus-within:ring-4 focus-within:ring-[var(--text-main)]/20 focus-within:border-[var(--text-main)] transition-all rounded-[var(--radius)]">
              <div className="px-4 py-4 border-r-[3px] border-[var(--text-main)] bg-gray-50 flex items-center justify-center shrink-0">
                <Globe className="h-5 w-5 text-[var(--text-main)]" strokeWidth={2} />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Enter URL to grab..."
                className="w-full px-4 py-4 text-base font-mono font-medium focus:outline-none bg-transparent placeholder:opacity-50 min-w-0"
                disabled={isLoading}
              />
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || (requireTurnstile && !turnstileToken)}
              className="px-8 py-4 text-lg font-bold window-border bg-primary text-primary-foreground shadow-btn hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all whitespace-nowrap flex items-center justify-center gap-2 rounded-[var(--radius)] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              ) : (
                <>
                  <Camera className="h-5 w-5" strokeWidth={2} />
                  Grab
                </>
              )}
            </button>
          </div>
          {requireTurnstile && (
            <div className="flex justify-center mt-6">
              <Turnstile
                sitekey={TURNSTILE_SITE_KEY}
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                appearance="interaction-only"
                size="compact"
                refreshExpired="auto"
              />
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8 text-sm font-bold">
            <span className="opacity-70 flex items-center gap-1">
              <span className="font-mono">Quick Try:</span>
            </span>
            {EXAMPLE_URLS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => { setUrl(u); setError(""); }}
                disabled={isLoading}
                className="px-3 py-1.5 border-dashed-select rounded-lg hover:bg-white/60 transition-colors font-mono hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {new URL(u).hostname}
              </button>
            ))}
          </div>
        </div>
      </WindowChrome>
      {error && (
        <div className="window-border rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="flex items-center justify-center">
        <p className="text-sm font-bold bg-white/70 backdrop-blur-sm window-border px-5 py-2.5 rounded-full shadow-btn inline-flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[var(--traffic-red)] border-2 border-[var(--text-main)] flex items-center justify-center text-white text-[10px]" aria-hidden>!</span>
          Data purges automatically in 10 mins
        </p>
      </div>
    </div>
  );
};

export default UrlInput;
