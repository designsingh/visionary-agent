import { Link, FileText, Download } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    { icon: Link, title: "Paste a URL", desc: "Enter any public webpage URL. We'll discover all pages on the site." },
    { icon: FileText, title: "Pick your formats", desc: "Choose screenshot, markdown, HTML, or all three. Select specific pages or grab everything." },
    { icon: Download, title: "Download & go", desc: "Files are ready instantly. Download individually or as a ZIP. We purge everything after 10 minutes." },
  ];

  return (
    <section id="how-it-works" className="border-t border-border px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-2 text-sm text-muted-foreground">Three steps. No account required.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-primary">Step {i + 1}</span>
              <h3 className="mt-1 text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
