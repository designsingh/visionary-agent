import { useState, useEffect } from "react";
import { Copy, Download, Check, Clock } from "lucide-react";
import type { DiscoveredPage } from "./PageDiscovery";

interface ResultsProps {
  pages: DiscoveredPage[];
  formats: string[];
  pageContent?: Record<string, { markdown?: string; html?: string; screenshot?: string }>;
}

const FALLBACK_MARKDOWN = `# Welcome to Example Corp

We build tools that help developers ship faster.

## Our Mission

At Example Corp, we believe that great software starts with great tools. Our platform provides everything you need to go from idea to production in record time.

## Features

- **Fast Builds** — Deploy in seconds, not minutes
- **Team Collaboration** — Built-in code review and pair programming
- **Analytics** — Real-time insights into your application performance

> "Example Corp cut our deployment time by 80%." — Jane Doe, CTO at StartupXYZ
`;

const FALLBACK_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Example Corp</title>
</head>
<body>
  <header>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/pricing">Pricing</a>
    </nav>
  </header>
  <main>
    <h1>Welcome to Example Corp</h1>
    <p>We build tools that help developers ship faster.</p>
  </main>
</body>
</html>`;

const Results = ({ pages, formats, pageContent = {} }: ResultsProps) => {
  const [countdown, setCountdown] = useState(600);
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const initial: Record<string, string> = {};
    pages.forEach((p) => { initial[p.path] = formats[0] || "screenshot"; });
    setActiveTabs(initial);
  }, [pages, formats]);

  useEffect(() => {
    const timer = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadFile = (content: string, filename: string, type = "text/plain") => {
    const blob = new Blob([content], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadScreenshot = (base64: string, filename: string) => {
    const bin = atob(base64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    const blob = new Blob([arr], { type: "image/png" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => copyToClipboard(text, id)}
      className="flex items-center gap-1.5 window-border rounded-lg px-3 py-1.5 text-xs font-bold text-[var(--text-main)] hover:bg-white/60 transition-colors shadow-btn active:translate-y-0.5 active:shadow-none"
    >
      {copied === id ? <Check className="h-3.5 w-3.5 text-[var(--traffic-green)]" /> : <Copy className="h-3.5 w-3.5" />}
      {copied === id ? "Copied" : "Copy"}
    </button>
  );

  const DownloadBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 window-border rounded-lg px-3 py-1.5 text-xs font-bold text-[var(--text-main)] hover:bg-white/60 transition-colors shadow-btn active:translate-y-0.5 active:shadow-none"
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between window-border bg-white px-4 py-3 shadow-window rounded-[var(--radius)]">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Available <span className="font-mono font-medium text-foreground tabular-nums">{formatTime(countdown)}</span></span>
        </div>
        <button className="flex items-center gap-2 window-border bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-btn hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all">
          <Download className="h-3.5 w-3.5" />
          Download All as ZIP
        </button>
      </div>

      {pages.map((page, i) => {
        const cardBg = [ "bg-[hsl(var(--card-1))]", "bg-[hsl(var(--card-2))]", "bg-[hsl(var(--card-3))]" ][i % 3];
        return (
        <div key={page.path} className={`window-border overflow-hidden rounded-[var(--radius)] shadow-window ${cardBg}`}>
          <div className="border-b-[3px] border-[var(--text-main)] px-4 py-3 flex items-center justify-between bg-white/40">
            <div className="flex gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-[var(--text-main)] bg-[var(--traffic-red)]" />
              <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-[var(--text-main)] bg-[var(--traffic-yellow)]" />
              <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-[var(--text-main)] bg-[var(--traffic-green)]" />
            </div>
            <div className="min-w-0 flex-1 mx-3">
              <h4 className="text-sm font-bold text-[var(--text-main)] truncate">{page.title}</h4>
              <p className="font-mono text-xs text-[var(--text-main)] opacity-80 truncate">{page.path}</p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-main)] border-2 border-[var(--text-main)] px-2 py-0.5 rounded shrink-0">Captured</span>
          </div>

          {formats.length > 1 && (
            <div className="flex gap-0 border-b border-border bg-muted/20 px-2">
              {formats.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveTabs((prev) => ({ ...prev, [page.path]: f }))}
                  className={`relative px-4 py-2.5 text-xs font-medium transition-colors ${
                    activeTabs[page.path] === f
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "screenshot" ? "Screenshot" : f === "markdown" ? "Markdown" : "HTML"}
                  {activeTabs[page.path] === f && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary" />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="p-5">
            {activeTabs[page.path] === "screenshot" && (() => {
              const screenshot = pageContent[page.path]?.screenshot;
              const fileBase = (page.path.replace(/\//g, "_") || "index").replace(/^_/, "");
              return (
                <div className="space-y-3">
                  {screenshot ? (
                    <div className="border border-border overflow-hidden ring-capture">
                      <img src={`data:image/png;base64,${screenshot}`} alt={page.title} className="max-h-80 w-full object-top object-contain" />
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-muted/50 border border-dashed border-border">
                      <span className="text-sm text-muted-foreground">Screenshot unavailable</span>
                    </div>
                  )}
                  <DownloadBtn
                    onClick={() => screenshot && downloadScreenshot(screenshot, `${fileBase}.png`)}
                    label="Download PNG"
                  />
                </div>
              );
            })()}

            {activeTabs[page.path] === "markdown" && (() => {
              const md = pageContent[page.path]?.markdown ?? FALLBACK_MARKDOWN;
              const fileBase = (page.path.replace(/\//g, "_") || "index").replace(/^_/, "");
              return (
                <div className="space-y-3">
                  <pre className="max-h-56 overflow-auto font-mono bg-muted/50 border border-border p-4 text-xs leading-relaxed text-foreground">
                    {md}
                  </pre>
                  <div className="flex gap-2">
                    <CopyBtn text={md} id={`md-${page.path}`} />
                    <DownloadBtn onClick={() => downloadFile(md, `${fileBase}.md`)} label="Download .md" />
                  </div>
                </div>
              );
            })()}

            {activeTabs[page.path] === "html" && (() => {
              const html = pageContent[page.path]?.html ?? FALLBACK_HTML;
              const fileBase = (page.path.replace(/\//g, "_") || "index").replace(/^_/, "");
              return (
                <div className="space-y-3">
                  <pre className="max-h-56 overflow-auto font-mono bg-muted/50 border border-border p-4 text-xs leading-relaxed text-foreground">
                    {html}
                  </pre>
                  <div className="flex gap-2">
                    <CopyBtn text={html} id={`html-${page.path}`} />
                    <DownloadBtn onClick={() => downloadFile(html, `${fileBase}.html`)} label="Download .html" />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      );})}
    </div>
  );
};

export default Results;
