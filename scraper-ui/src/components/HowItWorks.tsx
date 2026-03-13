import { Link, FileText, Download } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    { icon: Link, title: "Paste a URL", desc: "Enter any public webpage URL. We'll discover all pages on the site." },
    { icon: FileText, title: "Pick your formats", desc: "Choose screenshot, markdown, HTML, or all three. Select specific pages or grab everything." },
    { icon: Download, title: "Download & go", desc: "Files are ready instantly. Download individually or as a ZIP. We purge everything after 10 minutes." },
  ];

  return (
    <section id="how-it-works" className="relative z-10 border-t-2 border-border px-4 py-20 sm:px-6 bg-background">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">Process</p>
          <h2 className="text-2xl font-semibold text-foreground">How it works</h2>
          <p className="mt-1 text-sm text-muted-foreground">Three steps.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="border-2 border-border bg-card shadow-card rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 border-b-2 border-border px-4 py-2.5 bg-[hsl(var(--title-bar))]">
                <span className="font-mono text-lg font-bold text-primary-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-mono text-xs font-medium text-foreground/90">{s.title}</span>
              </div>
              <div className="p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-border bg-primary/10 mb-4">
                  <s.icon className="h-6 w-6 text-primary" strokeWidth={2} />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
