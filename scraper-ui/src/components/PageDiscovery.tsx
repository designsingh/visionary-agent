import { useState } from "react";
import { FileText, Code, Camera, CheckSquare, Square } from "lucide-react";
import WindowChrome from "./WindowChrome";

interface DiscoveredPage {
  path: string;
  title: string;
  size: string;
  selected: boolean;
}

interface PageDiscoveryProps {
  domain: string;
  pages: DiscoveredPage[];
  onExtract: (selectedPages: DiscoveredPage[], formats: string[]) => void;
}

const FORMAT_OPTIONS = [
  { key: "screenshot" as const, label: "Screenshot", icon: Camera, group: "visual" as const },
  { key: "markdown" as const, label: "Markdown", icon: FileText, group: "text" as const },
  { key: "html" as const, label: "HTML", icon: Code, group: "text" as const },
];

const PageDiscovery = ({ domain, pages: initialPages, onExtract }: PageDiscoveryProps) => {
  const [pages, setPages] = useState(initialPages);
  const [formats, setFormats] = useState({ screenshot: true, markdown: true, html: true });

  const allSelected = pages.every((p) => p.selected);
  const someSelected = pages.some((p) => p.selected);
  const selectedCount = pages.filter((p) => p.selected).length;

  const toggleAll = () => setPages(pages.map((p) => ({ ...p, selected: !allSelected })));
  const togglePage = (i: number) => setPages(pages.map((p, idx) => (idx === i ? { ...p, selected: !p.selected } : p)));
  const toggleFormat = (key: keyof typeof formats) => setFormats({ ...formats, [key]: !formats[key] });

  const selectedFormats = Object.entries(formats).filter(([, v]) => v).map(([k]) => k);

  return (
    <WindowChrome title={`${pages.length} pages on ${domain}`}>
      <div className="flex items-center justify-between border-b border-border-muted px-4 py-2 bg-muted/30">
        <button onClick={toggleAll} className="font-mono text-xs text-accent hover:text-accent/80 transition-colors">
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>

      {/* Page list — selection language */}
      <div className="divide-y divide-border-muted">
        {pages.map((page, i) => (
          <label
            key={page.path}
            className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors ${page.selected ? "bg-primary/5 border-l-4 border-l-sticker" : ""}`}
          >
            <button onClick={() => togglePage(i)} className="text-sticker shrink-0" type="button">
              {page.selected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-muted-foreground" />}
            </button>
            <span className="font-mono text-xs text-foreground min-w-[80px]">{page.path}</span>
            <span className="text-sm text-muted-foreground flex-1 truncate">{page.title}</span>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">{page.size}</span>
          </label>
        ))}
      </div>

      {/* Footer: formats + CTA — segmented panel */}
      <div className="border-t border-border-muted bg-muted/20 px-4 py-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground">Formats</span>
            <span className="text-xs text-muted-foreground">Visual</span>
            {FORMAT_OPTIONS.filter((f) => f.group === "visual").map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => toggleFormat(key)}
                className={`flex items-center gap-1.5 border px-2.5 py-1 text-xs font-medium transition-all ${
                  formats[key]
                    ? "border-sticker bg-sticker/15 text-sticker"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
            <span className="font-mono text-xs text-muted-foreground ml-1">Text</span>
            {FORMAT_OPTIONS.filter((f) => f.group === "text").map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => toggleFormat(key)}
                className={`flex items-center gap-1.5 border px-2.5 py-1 text-xs font-medium transition-all ${
                  formats[key]
                    ? "border-sticker bg-sticker/15 text-sticker"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onExtract(pages.filter((p) => p.selected), selectedFormats)}
              disabled={!someSelected || selectedFormats.length === 0}
              className="flex items-center gap-2 border-2 border-border bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 rounded-full"
            >
              Extract {selectedCount} page{selectedCount !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </div>
    </WindowChrome>
  );
};

export default PageDiscovery;
export type { DiscoveredPage };
