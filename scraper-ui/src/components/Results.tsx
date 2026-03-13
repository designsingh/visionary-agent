import { useState, useEffect } from "react";
import JSZip from "jszip";
import { Download, CheckCircle, FileText, Image } from "lucide-react";
import type { DiscoveredPage } from "./PageDiscovery";
import WindowChrome from "./WindowChrome";

interface ResultsProps {
  domain?: string;
  pages: DiscoveredPage[];
  formats: string[];
  pageContent?: Record<string, { markdown?: string; html?: string; screenshot?: string }>;
}

const Results = ({ domain = "", pages, formats, pageContent = {} }: ResultsProps) => {
  const [countdown, setCountdown] = useState(600);
  const [expanded, setExpanded] = useState(false);
  const INITIAL_SHOW = 5;

  useEffect(() => {
    const timer = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}m ${(s % 60).toString().padStart(2, "0")}s`;

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

  const downloadAllAsZip = async () => {
    const zip = new JSZip();
    const fileBase = (p: string) => (p.replace(/\//g, "_") || "index").replace(/^_/, "");
    for (const page of pages) {
      const base = fileBase(page.path);
      const content = pageContent[page.path];
      if (formats.includes("screenshot") && content?.screenshot) {
        const bin = atob(content.screenshot);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        zip.file(`${base}.png`, arr);
      }
      if (formats.includes("markdown") && content?.markdown) {
        zip.file(`${base}.md`, content.markdown);
      }
      if (formats.includes("html") && content?.html) {
        zip.file(`${base}.html`, content.html);
      }
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pagegrab-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const formatLabel = formats
    .map((f) => (f === "screenshot" ? "PNG" : f === "markdown" ? "MD" : "HTML"))
    .join(", ");

  const displayedPages = expanded ? pages : pages.slice(0, INITIAL_SHOW);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left sidebar: success + Download All + Batch Details (design ref) */}
      <aside className="lg:col-span-4 space-y-6">
        <WindowChrome title="status.ok">
          <div className="p-6 text-center">
            <div className="w-20 h-20 bg-white window-border mx-auto mb-4 flex items-center justify-center shadow-btn rounded-lg">
              <CheckCircle className="w-10 h-10 text-[var(--traffic-green)]" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-[var(--text-main)]">Grab Complete!</h2>
            <p className="text-sm font-medium opacity-80 mb-6 text-[var(--text-main)]">
              Found {pages.length} page{pages.length !== 1 ? "s" : ""} at{" "}
              <span className="font-mono">{domain || "site"}/*</span>
            </p>

            <button
              onClick={downloadAllAsZip}
              className="w-full py-4 text-lg font-bold window-border bg-primary text-primary-foreground shadow-btn flex items-center justify-center gap-2 rounded-[var(--radius)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
            >
              <Download className="w-5 h-5" />
              Download All (.ZIP)
            </button>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                disabled
                className="py-2 text-xs font-bold window-border bg-white/60 text-[var(--text-main)]/50 cursor-not-allowed flex items-center justify-center gap-1 rounded-lg"
              >
                PDF Pack
              </button>
              <button
                type="button"
                disabled
                className="py-2 text-xs font-bold window-border bg-white/60 text-[var(--text-main)]/50 cursor-not-allowed flex items-center justify-center gap-1 rounded-lg"
              >
                JSON Data
              </button>
            </div>
          </div>
        </WindowChrome>

        <div className="border-dashed-select rounded-xl p-5">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-[var(--text-main)]">
            Batch Details
          </h3>
          <div className="space-y-2 font-mono text-xs text-[var(--text-main)]">
            <div className="flex justify-between">
              <span>Size:</span>
              <span className="font-bold">—</span>
            </div>
            <div className="flex justify-between">
              <span>Pages:</span>
              <span className="font-bold">{pages.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Format:</span>
              <span className="font-bold">{formatLabel}</span>
            </div>
            <div className="flex justify-between">
              <span>Expires in:</span>
              <span className="font-bold text-[var(--traffic-red)]">{formatTime(countdown)}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Right: Captured Files list (design ref) */}
      <div className="lg:col-span-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-[var(--text-main)]">
            <FileText className="w-8 h-8 text-[var(--traffic-yellow)]" />
            Captured Files
          </h2>
          <span className="text-xs font-bold px-3 py-1 bg-white window-border rounded-lg">
            {pages.length} Items
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {displayedPages.map((page) => {
            const content = pageContent[page.path];
            const fileBase = (page.path.replace(/\//g, "_") || "index").replace(/^_/, "");
            const hasScreenshot = formats.includes("screenshot") && content?.screenshot;
            const hasMarkdown = formats.includes("markdown") && content?.markdown;
            const hasHtml = formats.includes("html") && content?.html;

            const handleDownload = () => {
              if (hasScreenshot) downloadScreenshot(content!.screenshot!, `${fileBase}.png`);
              else if (hasMarkdown) downloadFile(content!.markdown!, `${fileBase}.md`);
              else if (hasHtml) downloadFile(content!.html!, `${fileBase}.html`);
            };

            return (
              <div
                key={page.path}
                className="window-border bg-white p-4 flex items-center gap-4 rounded-[var(--radius)] hover:shadow-btn transition-all group"
              >
                <div className="w-16 h-12 window-border bg-muted/50 flex-shrink-0 rounded overflow-hidden flex items-center justify-center relative">
                  {hasScreenshot ? (
                    <img
                      src={`data:image/png;base64,${content!.screenshot}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="w-6 h-6 text-[var(--text-main)]/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate font-mono text-[var(--text-main)]">
                    {page.path}
                  </div>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {hasHtml && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[hsl(var(--card-3))] window-border rounded">
                        HTML
                      </span>
                    )}
                    {hasScreenshot && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[hsl(var(--card-1))] window-border rounded">
                        PNG
                      </span>
                    )}
                    {hasMarkdown && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[hsl(var(--card-2))] window-border rounded">
                        MD
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2 shrink-0">
                  <span className="font-mono text-[10px] font-bold opacity-60 text-[var(--text-main)]">
                    {page.size}
                  </span>
                  <button
                    onClick={handleDownload}
                    className="w-8 h-8 bg-white window-border flex items-center justify-center shadow-btn hover:bg-gray-50 rounded-lg active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    <Download className="w-4 h-4 text-[var(--text-main)]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {pages.length > INITIAL_SHOW && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-4 w-full py-3 font-bold text-sm window-border bg-white/80 rounded-lg hover:bg-white transition-colors text-[var(--text-main)]"
          >
            Show All {pages.length} Files
          </button>
        )}
      </div>
    </div>
  );
};

export default Results;
