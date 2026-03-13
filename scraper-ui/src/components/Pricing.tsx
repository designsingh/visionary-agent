import { useState } from "react";
import { Mail } from "lucide-react";

const Pricing = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="relative z-10 border-t-[3px] border-[var(--text-main)] px-6 py-20 bg-background">
      <div className="mx-auto max-w-xl">
        <p className="font-mono text-xs text-[var(--text-main)] opacity-70 uppercase tracking-wider mb-2 text-center">Pricing</p>
        <h2 className="text-2xl font-bold text-[var(--text-main)] text-center">Free</h2>
        <p className="mt-2 text-sm font-medium text-[var(--text-main)] opacity-90 leading-relaxed text-center max-w-md mx-auto">
          No sign-up, no limits. Basic tool stays free. Paid tiers later for bulk crawls & API.
        </p>

        <div className="mt-10 window-border rounded-[var(--radius)] overflow-hidden shadow-window bg-[hsl(var(--title-bar))]">
          <div className="border-b-[3px] border-[var(--text-main)] px-4 py-3 flex items-center justify-between bg-white/40 backdrop-blur-sm">
            <div className="flex gap-2">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-[var(--text-main)] bg-[var(--traffic-red)]" />
              <span className="w-3.5 h-3.5 rounded-full border-2 border-[var(--text-main)] bg-[var(--traffic-yellow)]" />
              <span className="w-3.5 h-3.5 rounded-full border-2 border-[var(--text-main)] bg-[var(--traffic-green)]" />
            </div>
            <span className="font-mono text-xs font-bold text-[var(--text-main)]">API launch — notify me</span>
          </div>
          <div className="p-5">
            {submitted ? (
              <p className="font-mono text-sm font-bold text-[var(--text-main)]">Got it. We&apos;ll reach out.</p>
            ) : (
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full border-2 border-border-muted bg-background py-2.5 pl-9 pr-3 text-sm font-mono rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <button
                  onClick={() => email.includes("@") && setSubmitted(true)}
                  className="window-border bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-btn hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all rounded-[var(--radius)] shrink-0"
                >
                  Notify
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
