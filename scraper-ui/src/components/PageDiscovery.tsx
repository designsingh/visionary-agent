import { useState } from "react";
import { FileText, Code, Camera, CheckSquare, Square } from "lucide-react";

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
  { key: "screenshot" as const, label: "Screenshot", icon: Camera },
  { key: "markdown" as const, label: "Markdown", icon: FileText },
  { key: "html" as const, label: "HTML", icon: Code },
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
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h3 className="text-sm font-semibold">
          {pages.length} pages found on <span className="text-primary">{domain}</span>
        </h3>
        <button onClick={toggleAll} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>

      {/* Page list */}
      <div className="divide-y divide-border">
        {pages.map((page, i) => (
          <label
            key={page.path}
            className="flex cursor-pointer items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors"
          >
            <button onClick={() => togglePage(i)} className="text-primary shrink-0">
              {page.selected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-muted-foreground" />}
            </button>
            <span className="text-sm font-medium text-foreground min-w-[80px]">{page.path}</span>
            <span className="text-sm text-muted-foreground flex-1">{page.title}</span>
            <span className="text-xs text-muted-foreground tabular-nums">{page.size}</span>
          </label>
        ))}
      </div>

      {/* Footer: formats + CTA */}
      <div className="border-t border-border bg-muted/30 px-5 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Formats</span>
            {FORMAT_OPTIONS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => toggleFormat(key)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  formats[key]
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Free during beta</span>
            <button
              onClick={() => onExtract(pages.filter((p) => p.selected), selectedFormats)}
              disabled={!someSelected || selectedFormats.length === 0}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50"
            >
              Extract {selectedCount} page{selectedCount !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageDiscovery;
export type { DiscoveredPage };
