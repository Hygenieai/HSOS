"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, CheckCircle2 } from "lucide-react";
import { scenarios, getPattern } from "@/lib/scenarios";
import { Navigation } from "@/components/Navigation";

function FindingCard({
  scenario,
  index,
}: {
  scenario: (typeof scenarios)[number];
  index: number;
}) {
  return (
    <div
      className="animate-card-in flex overflow-hidden rounded-xl border border-border bg-card"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Teal accent bar */}
      <div className="w-1 shrink-0 bg-primary" />

      <div className="flex flex-col gap-5 p-6">
        {/* Symptom label */}
        <p className="text-lg font-bold leading-snug text-foreground">
          {`"${scenario.label}"`}
        </p>

        {/* Why */}
        <div>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Why this is happening
          </h4>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {scenario.why}
          </p>
        </div>

        {/* Next move */}
        <div>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Your next move
          </h4>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {scenario.nextMove}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmailCapture({ selectedIds }: { selectedIds: number[] }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || !email.includes(".")) {
      setError("Enter a valid email address.");
      return;
    }
    
    // Save to localStorage
    localStorage.setItem(
      "hsos_video_request",
      JSON.stringify({ email, selectedIds, timestamp: Date.now() })
    );
    setSubmitted(true);
    setError("");
  }

  if (submitted) {
    return (
      <div className="mt-10 flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-5 text-center">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          {"You're in. I'll record a custom video for your results and send it over."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-xl border border-border bg-card px-6 py-5">
      <p className="text-sm font-medium text-foreground">
        {"Want a custom video breaking down your results?"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {"I'll review your selections and send a short video outlining what I would address first."}
      </p>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex flex-1 flex-col">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="you@company.com"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {error && <span className="mt-1 text-xs text-destructive">{error}</span>}
        </div>
        <button
          type="submit"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#00c4d6]"
        >
          <Mail className="h-3.5 w-3.5" />
          Send My Video
        </button>
      </form>
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();

  const selectedScenarios = useMemo(() => {
    const raw = searchParams.get("s");
    if (!raw) return [];
    const ids = raw.split(",").map(Number).filter(Boolean);
    return ids
      .map((id) => scenarios.find((s) => s.id === id))
      .filter(Boolean) as (typeof scenarios)[number][];
  }, [searchParams]);

  const selectedIds = selectedScenarios.map((s) => s.id);
  const pattern = getPattern(selectedIds);

  if (selectedScenarios.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          No symptoms selected
        </h1>
        <p className="mt-3 text-muted-foreground">
          Go back and pick what sounds like your reality.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-[#00c4d6]"
        >
          Start Over
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="animate-fade-up mb-10">
          <h1 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {"Here's what we found."}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            {"Based on what you told us, here's what's structurally broken \u2014 and what to do about it."}
          </p>
        </div>

        {/* Findings */}
        <section className="flex flex-col gap-5">
          {selectedScenarios.map((scenario, i) => (
            <FindingCard key={scenario.id} scenario={scenario} index={i} />
          ))}
        </section>

        {/* Pattern (only if 2+ selected) */}
        {pattern && (
          <section
            className="animate-card-in mt-10"
            style={{ animationDelay: `${selectedScenarios.length * 120 + 100}ms` }}
          >
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-3 text-lg font-bold text-foreground">
                The pattern behind your symptoms
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {pattern}
              </p>
            </div>
          </section>
        )}

        {/* CTA */}
        <section
          className="animate-card-in mt-10"
          style={{
            animationDelay: `${selectedScenarios.length * 120 + (pattern ? 220 : 100)}ms`,
          }}
        >
          <div className="flex overflow-hidden rounded-xl border border-border bg-card">
            <div className="w-1 shrink-0 bg-primary" />
            <div className="flex flex-col gap-4 p-6">
              <h3 className="text-lg font-bold text-foreground">
                Review this diagnostic with me.
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {"I help founders install structured sales systems that operate independently. Not theory. Not templates. A process engineered around your product, your market, and your sales cycle."}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="https://calendly.com/jakeweber-hygenieai/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-[#00c4d6]"
                >
                  Book a Complimentary Overview
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/call"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-bold text-foreground transition-colors hover:border-primary hover:bg-card"
                >
                  Try Live Coaching Tool
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                A complimentary overview of your sales process to give you clarity on how to move forward. No pitch. Just structure.
              </p>
            </div>
          </div>
        </section>

        {/* Secondary email capture */}
        <EmailCapture selectedIds={selectedIds} />

        {/* Start over link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Start over
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          &copy; 2025 Hygenie.SOS
        </footer>
        </div>
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
