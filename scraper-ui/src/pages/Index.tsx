import { useState } from "react";
import Header from "@/components/Header";
import UrlInput from "@/components/UrlInput";
import CrawlLoader from "@/components/CrawlLoader";
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          {/* Hero copy */}
          {step === "input" && (
            <div className="text-center mb-8">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Extract any webpage as<br />
                <span className="text-primary">Screenshot, Markdown & HTML</span>
              </h1>
              <p className="mt-3 text-base text-muted-foreground max-w-lg mx-auto">
                Paste a URL, pick your pages and formats, download clean files. No sign-up, no API keys, completely free.
              </p>
            </div>
          )}

          <div className="space-y-5">
            {(step === "input" || step === "crawling" || step === "discovery") && (
              <UrlInput onSubmit={handleSubmit} isLoading={step === "crawling"} />
            )}

            {error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {step === "crawling" && <CrawlLoader domain={domain} foundUrls={foundUrls} />}
            {step === "discovery" && <PageDiscovery domain={domain} pages={discoveredPages} onExtract={handleExtract} />}
            {step === "extracting" && <CrawlLoader domain={domain} extracting />}

            {step === "results" && (
              <>
                <button
                  onClick={handleReset}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  ← Grab another URL
                </button>
                <Results pages={resultPages} formats={resultFormats} pageContent={pageContent} />
              </>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-10">
            Built by a designer who was tired of copying and pasting.
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
