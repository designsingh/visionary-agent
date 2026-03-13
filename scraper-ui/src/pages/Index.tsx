import { useState } from "react";
import { MousePointer2 } from "lucide-react";
import Header from "@/components/Header";
import UrlInput from "@/components/UrlInput";
import CrawlTimeline from "@/components/CrawlTimeline";
import HomepageActivityFeed from "@/components/HomepageActivityFeed";
import PageDiscovery, { type DiscoveredPage } from "@/components/PageDiscovery";
import Results from "@/components/Results";
import HowItWorks from "@/components/HowItWorks";
import UseCases from "@/components/UseCases";
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
    let origin = "";
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      setDomain(parsed.hostname);
      origin = parsed.origin;
      setBaseUrl(origin);
    } catch {
      setDomain(url);
      origin = url.startsWith("http") ? url : `https://${url}`;
      setBaseUrl(origin);
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
        const pageList = pages || [];
        setFoundUrls((prev) => {
          if (pageList.length > 0) {
            return pageList.map((p: { url?: string; path?: string; title?: string }) => ({
              url: p.url || origin + (p.path || ""),
              title: p.title,
            }));
          }
          return prev;
        });
        setDiscoveredPages(pageList);
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

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 pt-8 lg:pt-12 flex flex-col items-center relative z-10">
        {/* Step 1: URL entry — hero + input + activity */}
        {step === "input" && (
          <div className="w-full max-w-3xl">
            <div className="text-center mb-10 relative">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 relative inline-block text-[var(--text-main)]">
                Grab any webpage.
                <MousePointer2 className="absolute -right-6 md:-right-8 bottom-1 w-8 h-8 md:w-9 md:h-9 opacity-80 rotate-12 text-[var(--text-main)]" aria-hidden />
              </h1>
              <p className="text-base md:text-lg max-w-2xl mx-auto font-medium opacity-90 leading-relaxed text-[var(--text-main)]">
                Capture, archive, and analyze — rendering perfectly.
                <br />
                Built with internet-native charm.
              </p>
            </div>
            <div className="space-y-10">
              <UrlInput onSubmit={handleSubmit} isLoading={false} />
              {error && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <HomepageActivityFeed />
            </div>
            <p className="text-center font-medium text-sm text-[var(--text-main)] opacity-90 mt-16">
              <a href="https://linkedin.com/in/preetarjun" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Built by a designer tired of copy-pasting screenshots.
              </a>
            </p>
          </div>
        )}

        {/* Step 2a: Crawl in progress — dedicated view */}
        {(step === "crawling" || step === "extracting") && (
          <div className="w-full max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--text-main)]">
                {step === "extracting" ? "Extracting content…" : `Discovering pages on ${domain}`}
              </h2>
              <button
                onClick={handleReset}
                className="font-bold text-sm text-[var(--text-main)] hover:underline transition-colors"
              >
                ← Start over
              </button>
            </div>
            <CrawlTimeline domain={domain} foundUrls={foundUrls} extracting={step === "extracting"} extractingTotal={step === "extracting" ? resultPages.length : 0} />
          </div>
        )}

        {/* Step 2b: Select pages & formats — dedicated view */}
        {step === "discovery" && (
          <div className="w-full max-w-6xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--text-main)]">
                Select pages to grab from {domain}
              </h2>
              <button
                onClick={handleReset}
                className="font-bold text-sm text-[var(--text-main)] hover:underline transition-colors"
              >
                ← Start over
              </button>
            </div>
            {error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <PageDiscovery domain={domain} pages={discoveredPages} onExtract={handleExtract} />
          </div>
        )}

        {/* Step 3: Results — dedicated view */}
        {step === "results" && (
          <div className="w-full max-w-6xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--text-main)]">
                Your files are ready
              </h2>
              <button
                onClick={handleReset}
                className="font-bold text-sm text-[var(--text-main)] hover:underline transition-colors"
              >
                ← Grab another URL
              </button>
            </div>
            {error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Results domain={domain} pages={resultPages} formats={resultFormats} pageContent={pageContent} />
          </div>
        )}
      </main>

      {step === "input" && (
        <>
          <HowItWorks />
          <UseCases />
        </>
      )}
      <Footer />
    </div>
  );
};

export default Index;
