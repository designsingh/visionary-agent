import { useState, useMemo } from "react";
import { FileText, Code, Camera, FolderTree, Download, ChevronDown, Folder, FileType } from "lucide-react";

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
  { key: "screenshot" as const, label: "Full page PNG", icon: Camera },
  { key: "markdown" as const, label: "Markdown extract", icon: FileText },
  { key: "html" as const, label: "HTML archive", icon: Code },
];

const PageDiscovery = ({ domain, pages: initialPages, onExtract }: PageDiscoveryProps) => {
  const [pages, setPages] = useState(() =>
    initialPages.map((p) => ({ ...p, selected: p.selected ?? true }))
  );
  const [formats, setFormats] = useState({ screenshot: true, markdown: true, html: true });
  const filteredPages = pages;

  const allSelected = pages.every((p) => p.selected);
  const someSelected = pages.some((p) => p.selected);
  const selectedCount = pages.filter((p) => p.selected).length;

  const toggleAll = () => setPages(pages.map((p) => ({ ...p, selected: !allSelected })));
  const togglePage = (i: number) => setPages(pages.map((p, idx) => (idx === i ? { ...p, selected: !p.selected } : p)));
  const toggleFormat = (key: keyof typeof formats) => setFormats({ ...formats, [key]: !formats[key] });
  const setAllFormats = (v: boolean) => setFormats({ screenshot: v, markdown: v, html: v });

  const selectedFormats = Object.entries(formats).filter(([, v]) => v).map(([k]) => k);
  const canExtract = someSelected && selectedFormats.length > 0;

  // Build hierarchical tree from paths (Variant design ref)
  type TreeNode = { path: string; name: string; children: TreeNode[]; isLeaf: boolean };
  const siteStructureTree = useMemo(() => {
    const root: TreeNode = { path: "", name: "", children: [], isLeaf: false };
    const pathSet = new Set(pages.map((p) => p.path));
    pages.forEach((p) => {
      const parts = p.path.split("/").filter(Boolean);
      let curr = root;
      let acc = "";
      parts.forEach((part, i) => {
        acc += (acc ? "/" : "/") + part;
        const existing = curr.children.find((c) => c.path === acc);
        if (existing) {
          curr = existing;
        } else {
          const isLeaf = i === parts.length - 1 || !pathSet.has(acc);
          const node: TreeNode = {
            path: acc,
            name: part,
            children: [],
            isLeaf: i === parts.length - 1,
          };
          curr.children.push(node);
          curr = node;
        }
      });
    });
    // Sort and limit depth for display
    const walk = (n: TreeNode, max = 12): TreeNode[] => {
      if (max <= 0) return [];
      return n.children
        .slice(0, 8)
        .flatMap((c) => [
          c,
          ...(c.children.length > 0 ? walk(c, max - 1).map((child) => ({ ...child })) : []),
        ]);
    };
    return root.children.slice(0, 8);
  }, [pages]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      {/* Left: Site Structure (mustard) — design ref */}
      <aside className="lg:col-span-3">
        <div className="window-border rounded-[var(--radius)] overflow-hidden window-shadow bg-card-2">
          <h3 className="font-bold text-sm mb-4 border-b-2 border-[var(--text-main)] px-4 pt-4 pb-2 flex items-center gap-2 text-[var(--text-main)]">
            <FolderTree className="h-4 w-4" strokeWidth={2} />
            Site Structure
          </h3>
          <div className="p-4 font-mono text-xs space-y-3">
            {siteStructureTree.length === 0 ? (
              <span className="text-[var(--text-main)] opacity-90">No structure available</span>
            ) : (
              siteStructureTree.map((node) => {
                const renderNode = (n: TreeNode, depth: number) => (
                  <div key={n.path}>
                    <div
                      className={`flex items-center gap-2 text-[var(--text-main)] font-medium ${depth === 1 ? "ml-4 border-l-2 border-[var(--text-main)]/40 pl-2" : depth === 2 ? "ml-8 border-l-2 border-[var(--text-main)]/40 pl-2" : depth > 2 ? "ml-10 border-l-2 border-[var(--text-main)]/40 pl-2" : ""} ${n.isLeaf && filteredPages.some((p) => p.path === n.path) ? "text-[var(--btn-bg)]" : ""}`}
                      style={depth > 2 ? { marginLeft: `${depth * 16}px` } : undefined}
                    >
                      {n.children.length > 0 ? (
                        <>
                          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                          <Folder className="h-3.5 w-3.5 shrink-0" />
                          {n.path}
                        </>
                      ) : (
                        <>
                          <FileType className="h-3.5 w-3.5 shrink-0" />
                          {n.name}
                        </>
                      )}
                    </div>
                    {n.children.slice(0, 6).map((child) => renderNode(child, depth + 1))}
                  </div>
                );
                return renderNode(node, 0);
              })
            )}
          </div>
        </div>
      </aside>

      {/* Right: Discovered Pages — blush bg, Format + controls + list — always above fold */}
      <div className="lg:col-span-7">
        <div className="window-border rounded-[var(--radius)] overflow-hidden window-shadow bg-window-main">
          {/* Top: Title, Format, Pause, Start Extraction */}
          <div className="border-b-[3px] border-[var(--text-main)] px-4 py-3 bg-white/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-bold text-sm text-[var(--text-main)]">Discovered Pages — {domain}</span>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  className="text-xs font-bold text-[var(--text-main)] hover:underline transition-colors window-border rounded-lg px-3 py-2 bg-white btn-shadow hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
                >
                  Pause
                </button>
                <button
                  onClick={() => onExtract(pages.filter((p) => p.selected), selectedFormats)}
                  disabled={!canExtract}
                  className="flex items-center gap-2 window-border bg-btn-main text-btn-main px-6 py-2 text-sm font-bold btn-shadow hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-[var(--radius)]"
                >
                  Start Extraction
                </button>
              </div>
            </div>
            {/* Format options — inline at top so never below fold */}
            <div className="flex flex-wrap items-center gap-4">
              {FORMAT_OPTIONS.map(({ key, label, icon: Icon }) => (
                <label key={key} className="flex cursor-pointer items-center gap-2 group">
                  <input
                    type="checkbox"
                    checked={formats[key]}
                    onChange={() => toggleFormat(key)}
                    className="custom-checkbox rounded-full shrink-0"
                  />
                  <Icon className="h-3.5 w-3.5 text-[var(--text-main)] shrink-0" />
                  <span className="text-xs font-bold text-[var(--text-main)] group-hover:underline">{label}</span>
                </label>
              ))}
              <label className="flex cursor-pointer items-center gap-2 group">
                <input
                  type="checkbox"
                  checked={selectedFormats.length === 3}
                  onChange={(e) => setAllFormats(e.target.checked)}
                  className="custom-checkbox rounded-full shrink-0"
                />
                <span className="text-xs font-bold text-[var(--text-main)] group-hover:underline">All formats</span>
              </label>
            </div>
          </div>

          {/* Select row — above results */}
          <div className="border-b-2 border-[var(--text-main)]/20 px-4 py-2 flex items-center gap-4 bg-white/30">
            <button
              onClick={toggleAll}
              className="text-xs font-bold text-[var(--text-main)] hover:underline transition-colors"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
            <span className="font-mono text-xs text-[var(--text-main)]">
              {selectedCount} selected
            </span>
          </div>

          {/* Vertical list */}
          <div className="p-4">
            {!canExtract && (
              <p className="text-xs text-[var(--text-main)]/70 mb-2">
                {!someSelected ? "Select at least one page" : "Select at least one format"}
              </p>
            )}
            <div className="flex flex-col gap-2">
              {filteredPages.map((page) => {
                const i = pages.findIndex((p) => p.path === page.path);
                return (
                  <label
                    key={page.path}
                    className={`flex cursor-pointer items-center gap-3 window-border rounded-lg px-3 py-2.5 transition-shadow bg-white hover:shadow-[4px_4px_0px_0px_var(--text-main)] ${
                      page.selected ? "shadow-[4px_4px_0px_0px_var(--text-main)]" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={page.selected}
                      onChange={() => togglePage(i)}
                      className="custom-checkbox mt-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="font-mono text-xs font-bold text-[var(--text-main)] truncate">{page.path}</div>
                      {page.title && (
                        <div className="text-[11px] text-[var(--text-main)]/70 truncate">{page.title}</div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-[var(--text-main)]/50 uppercase shrink-0">Ready</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageDiscovery;
export type { DiscoveredPage };
