import { useState } from "react";
import { Mail } from "lucide-react";

const Pricing = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="relative z-10 border-t-2 border-border px-4 py-20 sm:px-6 bg-background">
      <div className="mx-auto max-w-xl">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2 text-center">Pricing</p>
        <h2 className="text-2xl font-semibold text-foreground text-center">Free</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed text-center max-w-md mx-auto">
          No sign-up, no limits. Basic tool stays free. Paid tiers later for bulk crawls & API.
        </p>

        <div className="mt-10 border-2 border-border bg-card shadow-card rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 border-b-2 border-border px-4 py-2.5 bg-[hsl(var(--title-bar))]">
            <Mail className="h-4 w-4 text-white" />
            <span className="font-mono text-sm font-medium text-white">API launch — notify me</span>
          </div>
          <div className="p-5">
            {submitted ? (
              <p className="font-mono text-sm text-sticker">Got it. We&apos;ll reach out.</p>
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
                  className="border-2 border-border bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors rounded-full shrink-0"
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
