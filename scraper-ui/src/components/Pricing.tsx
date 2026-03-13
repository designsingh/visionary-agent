import { useState } from "react";
import { Mail } from "lucide-react";

const Pricing = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="border-t border-border px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-lg text-center">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">Pricing</span>
        <h2 className="text-2xl font-semibold tracking-tight">Free. For real.</h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          PageGrab is free during beta. No hidden limits, no credit card, no sign-up. When we add paid tiers, they'll be for heavy usage — bulk crawls, API access, and longer storage. The basic tool stays free forever.
        </p>

        <div className="mt-8">
          <p className="text-xs font-medium text-muted-foreground mb-3">Want to know when we launch the API?</p>
          {submitted ? (
            <p className="text-sm font-medium text-primary">You're on the list! We'll keep you posted.</p>
          ) : (
            <div className="flex gap-2 mx-auto max-w-sm">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <button
                onClick={() => email.includes("@") && setSubmitted(true)}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all"
              >
                Notify me
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
