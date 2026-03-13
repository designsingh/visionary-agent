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
    <section className="relative z-10 border-t-2 border-border px-4 py-20 sm:px-6 bg-muted/20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">Use cases</p>
          <h2 className="text-2xl font-semibold text-foreground">Results, not API docs</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <div key={c.title} className="border-2 border-border bg-card shadow-card rounded-lg overflow-hidden hover:shadow-md hover:border-primary/40 transition-all group">
              <div className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-border bg-accent/20 group-hover:bg-accent/30 transition-colors mb-4">
                  <c.icon className="h-5 w-5 text-accent-foreground" strokeWidth={2} />
                </div>
                <h3 className="text-base font-semibold text-foreground">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
