import { useState } from "react";
import Header from "@/components/Header";
import UrlInput from "@/components/UrlInput";
import CrawlTimeline from "@/components/CrawlTimeline";
import HomepageActivityFeed from "@/components/HomepageActivityFeed";
import PageDiscovery, { type DiscoveredPage } from "@/components/PageDiscovery";
import Results from "@/components/Results";
import HowItWorks from "@/components/HowItWorks";
import UseCases from "@/components/UseCases";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

interface CrawlRecord { path: string; html?: string; markdown?: string; url: string }

type Step = "input" | "crawling" | "discovery" | "extracting" | "results";

const Index = () => {
  const [step, setStep] = useState<Step>("input");
  const [domain, setDomain] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [discoveredPages, setDiscoveredPages] = useState<DiscoveredPage[]>([]);
  const [crawlRecords, setCrawlRecords] = useState<CrawlRecord[]>([]);
  const [resultPages, setResultPages] = useState<DiscoveredPage[]>([]);
  const [resultFormats, setResultFormats] = useState<string[]>([]);
  const [pageContent, setPageContent] = useState<Record<string, { markdown?: string; html?: string; screenshot?: string }>>({});
  const [error, setError] = useState("");
  const [foundUrls, setFoundUrls] = useState<{ url: string; title?: string }[]>([]);

  const handleSubmit = (url: string) => {
    try {
      setDomain(new URL(url).hostname);
      setBaseUrl(new URL(url).origin);
    } catch {
      setDomain(url);
      setBaseUrl(url.startsWith("http") ? url : `https://${url}`);
    }
    setError("");
    setFoundUrls([]);
    setStep("crawling");

    const streamUrl = `${API_BASE}/api/scraper/crawl-stream?url=${encodeURIComponent(url)}&limit=30`;
    const evt = new EventSource(streamUrl);

    evt.addEventListener("url", (e) => {
      try {
        const { url: u, title } = JSON.parse((e as MessageEvent).data);
        if (u) setFoundUrls((prev) => [...prev, { url: u, title }]);
      } catch {}
    });

    evt.addEventListener("done", (e) => {
      try {
        const { pages, records } = JSON.parse((e as MessageEvent).data);
        setDiscoveredPages(pages || []);
        setCrawlRecords(records || []);
        setStep("discovery");
      } catch {}
      evt.close();
    });

    evt.addEventListener("crawl_error", (e) => {
      try {
        const { error: err } = JSON.parse((e as MessageEvent).data || "{}");
        setError(err || "Crawl failed");
      } catch {
        setError("Crawl failed");
      }
      setStep("input");
      evt.close();
    });

    evt.onerror = () => {
      evt.close();
      setStep((s) => {
        if (s === "crawling") fallbackToPostCrawl(url);
        return s;
      });
    };
  };

  const fallbackToPostCrawl = async (url: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/scraper/crawl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, limit: 30 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Crawl failed");
      setError("");
      setDiscoveredPages(data.pages);
      setCrawlRecords(data.records);
      setStep("discovery");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Crawl failed");
      setStep("input");
    }
  };

  const handleExtract = async (pages: DiscoveredPage[], formats: string[]) => {
    setResultPages(pages);
    setResultFormats(formats);
    setStep("extracting");
    const content: Record<string, { markdown?: string; html?: string; screenshot?: string }> = {};
    const pathToRecord = Object.fromEntries(crawlRecords.map((r) => [r.path, r]));
    for (const p of pages) {
      const rec = pathToRecord[p.path];
      if (rec) {
        if (formats.includes("markdown") && rec.markdown) content[p.path] = { ...content[p.path], markdown: rec.markdown };
        if (formats.includes("html") && rec.html) content[p.path] = { ...content[p.path], html: rec.html };
      }
    }
    if (formats.includes("screenshot")) {
      try {
        const urls = pages.map((p) => pathToRecord[p.path]?.url).filter(Boolean);
        const res = await fetch(`${API_BASE}/api/scraper/screenshots`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls }),
        });
        const screenshots = await res.json();
        for (const p of pages) {
          const rec = pathToRecord[p.path];
          if (rec && screenshots[rec.url]) {
            content[p.path] = { ...content[p.path], screenshot: screenshots[rec.url] };
          }
        }
      } catch {
        // Screenshots failed, continue with what we have
      }
    }
    setPageContent(content);
    setStep("results");
  };

  const handleReset = () => {
    setStep("input");
    setDomain("");
    setBaseUrl("");
    setDiscoveredPages([]);
    setCrawlRecords([]);
    setResultPages([]);
    setResultFormats([]);
    setPageContent({});
    setError("");
    setFoundUrls([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Header />

      <main className="flex-1 px-4 py-12 sm:px-6 relative z-10">
        <div className="mx-auto max-w-3xl">
          {/* Hero — simple, utility-first + 90s Hello */}
          {step === "input" && (
            <div className="mb-10 relative">
              <div className="absolute -top-1 right-0 flex items-center gap-1.5 px-3 py-1.5 border-2 border-border bg-sticker shadow-card rounded-full">
                <span className="font-mono text-xs font-medium text-white">Hello!</span>
              </div>
              <p className="font-mono text-xs text-muted-foreground mb-2">URL → Screenshot · Markdown · HTML</p>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                Grab any webpage.
              </h1>
              <p className="mt-3 text-sm text-muted-foreground max-w-lg leading-relaxed">
                Paste a URL, select pages, download. No sign-up.
              </p>
            </div>
          )}

          <div className="space-y-5">
            {(step === "input" || step === "crawling" || step === "discovery") && (
              <UrlInput onSubmit={handleSubmit} isLoading={step === "crawling"} />
            )}

            {step === "input" && <HomepageActivityFeed />}

            {error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {step === "crawling" && <CrawlTimeline domain={domain} foundUrls={foundUrls} />}
            {step === "discovery" && <PageDiscovery domain={domain} pages={discoveredPages} onExtract={handleExtract} />}
            {step === "extracting" && <CrawlTimeline domain={domain} foundUrls={foundUrls} extracting />}

            {step === "results" && (
              <>
                <button
                  onClick={handleReset}
                  className="font-mono text-xs text-accent hover:text-accent/80 transition-colors"
                >
                  ← Grab another URL
                </button>
                <Results pages={resultPages} formats={resultFormats} pageContent={pageContent} />
              </>
            )}
          </div>

          <p className="text-center font-mono text-xs text-muted-foreground mt-12">
            Built by a designer tired of copy-pasting screenshots.{' '}
            <a href="https://linkedin.com/in/preetarjun" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              Preeta
            </a>
          </p>
        </div>
      </main>

      <HowItWorks />
      <UseCases />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
