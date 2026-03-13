import { Bot, Camera, FolderSync, Search, Briefcase, GraduationCap } from "lucide-react";

const UseCases = () => {
  const cases = [
    { icon: Bot, title: "Feed your AI tools", desc: "Get clean markdown to drop into Claude, ChatGPT, NotebookLM, or any LLM." },
    { icon: Camera, title: "Archive for compliance", desc: "Full screenshot + clean HTML for regulatory records before pages change or go offline." },
    { icon: FolderSync, title: "Content migration", desc: "Moving to a new CMS? Grab all your pages as clean markdown in one click." },
    { icon: Search, title: "Competitor research", desc: "Screenshot and extract competitor pages for your strategy deck or analysis." },
    { icon: Briefcase, title: "Client deliverables", desc: "Consultants: grab client site content without begging for CMS access." },
    { icon: GraduationCap, title: "Academic research", desc: "Extract article text cleanly — no ads, no clutter, just the content." },
  ];

  return (
    <section className="relative z-10 px-6 py-20 sm:px-6 bg-muted/30">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 border-b-[3px] border-[var(--text-main)] pb-4">
          <h2 className="text-2xl font-bold text-[var(--text-main)]">Results, not API docs</h2>
          <p className="mt-1 text-sm font-medium text-[var(--text-main)] opacity-80">Use cases</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <div key={c.title} className="window-border rounded-[var(--radius)] overflow-hidden shadow-window hover:-translate-y-1 hover:shadow-window-hover transition-all bg-white">
              <div className="border-b-[3px] border-[var(--text-main)] px-3 py-2 flex items-center justify-between bg-white/40">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-[var(--text-main)] bg-[var(--traffic-red)]" />
                  <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-[var(--text-main)] bg-[var(--traffic-yellow)]" />
                  <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-[var(--text-main)] bg-[var(--traffic-green)]" />
                </div>
              </div>
              <div className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg window-border bg-[hsl(var(--accent))]/20 mb-4">
                  <c.icon className="h-5 w-5 text-[var(--text-main)]" strokeWidth={2} />
                </div>
                <h3 className="text-base font-bold text-[var(--text-main)]">{c.title}</h3>
                <p className="mt-2 text-sm font-medium text-[var(--text-main)] opacity-90 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
