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
    <section className="border-t border-border px-4 py-20 sm:px-6 bg-muted/30">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold tracking-tight">
            Built for people who need results, not API docs
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">From compliance teams to content strategists.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <div key={c.title} className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <c.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold">{c.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
