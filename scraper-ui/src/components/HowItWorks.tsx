import { Link, FileText, Download } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    { icon: Link, title: "Paste a URL", desc: "Enter any public webpage URL. We'll discover all pages on the site." },
    { icon: FileText, title: "Pick your formats", desc: "Choose screenshot, markdown, HTML, or all three. Select specific pages or grab everything." },
    { icon: Download, title: "Download & go", desc: "Files are ready instantly. Download individually or as a ZIP. We purge everything after 10 minutes." },
  ];

  const cardColors = ["bg-[hsl(var(--card-1))]", "bg-[hsl(var(--card-2))]", "bg-[hsl(var(--card-3))]"];
  return (
    <section id="how-it-works" className="relative z-10 border-t-[3px] border-[var(--text-main)] px-6 py-20 sm:px-6 bg-background">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 border-b-[3px] border-[var(--text-main)] pb-4">
          <h2 className="text-2xl font-bold text-[var(--text-main)]">How it works</h2>
          <p className="mt-1 text-sm font-medium text-[var(--text-main)] opacity-80">Three steps.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className={`window-border rounded-[var(--radius)] overflow-hidden shadow-window hover:-translate-y-1 hover:shadow-window-hover transition-all ${cardColors[i]}`}>
              <div className="border-b-[3px] border-[var(--text-main)] px-4 py-3 flex items-center justify-between bg-white/40">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-[var(--text-main)] bg-[var(--traffic-red)]" />
                  <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-[var(--text-main)] bg-[var(--traffic-yellow)]" />
                  <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-[var(--text-main)] bg-[var(--traffic-green)]" />
                </div>
                <span className="font-mono text-xs font-bold text-[var(--text-main)]">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg window-border bg-white/80 mb-4">
                  <s.icon className="h-6 w-6 text-[var(--text-main)]" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-[var(--text-main)] mb-2">{s.title}</h3>
                <p className="text-sm font-medium text-[var(--text-main)] opacity-90 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
