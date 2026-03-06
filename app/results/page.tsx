"use client";

import { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
      className="animate-card-in flex overflow-hidden rounded-xl"
      style={{
        animationDelay: `${index * 120}ms`,
        backgroundColor: "#0F0F0F",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Teal accent bar */}
      <div className="w-1 shrink-0" style={{ backgroundColor: "#00989E" }} />

      <div className="flex flex-col gap-5 p-6">
        {/* Symptom label */}
        <p
          className="text-lg leading-snug"
          style={{ color: "#FFFFFF", fontFamily: '"Poppins", sans-serif', fontWeight: 900 }}
        >
          {`"${scenario.label}"`}
        </p>

        {/* Why */}
        <div>
          <h4
            className="mb-1.5 text-xs uppercase tracking-wider"
            style={{ color: "#00989E", fontFamily: '"Poppins", sans-serif', fontWeight: 900 }}
          >
            Why this is happening
          </h4>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.65)", fontFamily: '"Lato", sans-serif' }}
          >
            {scenario.why}
          </p>
        </div>

        {/* Next move */}
        <div>
          <h4
            className="mb-1.5 text-xs uppercase tracking-wider"
            style={{ color: "#00989E", fontFamily: '"Poppins", sans-serif', fontWeight: 900 }}
          >
            Your next move
          </h4>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.65)", fontFamily: '"Lato", sans-serif' }}
          >
            {scenario.nextMove}
          </p>
        </div>
      </div>
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
      <main
        className="flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center"
        style={{ backgroundColor: "#0A0A0A" }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&family=Lato:wght@400;500;600&display=swap');`}</style>
        <h1
          className="text-2xl"
          style={{ color: "#FFFFFF", fontFamily: '"Poppins", sans-serif', fontWeight: 900 }}
        >
          No symptoms selected
        </h1>
        <p
          className="mt-3"
          style={{ color: "rgba(255,255,255,0.65)", fontFamily: '"Lato", sans-serif' }}
        >
          Go back and pick what sounds like your reality.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold transition-colors"
          style={{ backgroundColor: "#00989E", color: "#FFFFFF", fontFamily: '"Lato", sans-serif' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#00B8BF")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#00989E")}
        >
          Start Over
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#0A0A0A" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&family=Lato:wght@400;500;600&display=swap');`}</style>
      <Navigation />
      <div className="px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="animate-fade-up mb-10">
          <h1
            className="text-balance text-3xl tracking-tight md:text-4xl"
            style={{ color: "#FFFFFF", fontFamily: '"Poppins", sans-serif', fontWeight: 900 }}
          >
            {"Here's what we found."}
          </h1>
          <p
            className="mt-3 text-lg leading-relaxed"
            style={{ color: "rgba(255,255,255,0.65)", fontFamily: '"Lato", sans-serif' }}
          >
            {"Based on what you told us, here\u2019s what\u2019s structurally broken \u2014 and what to do about it."}
          </p>
        </div>

        {/* Tool Cards — moved above findings */}
        <section className="animate-card-in mb-10">
          <div className="grid gap-5 sm:grid-cols-3">
            {/* Call Analysis */}
            <div
              className="flex flex-col rounded-xl p-6"
              style={{ backgroundColor: "#0F0F0F", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3
                  className="text-lg"
                  style={{ color: "#FFFFFF", fontFamily: '"Poppins", sans-serif', fontWeight: 900 }}
                >
                  Call Analysis
                </h3>
                <span
                  className="rounded-full px-3 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: "rgba(0,152,158,0.15)", color: "#00989E" }}
                >
                  FREE
                </span>
              </div>
              <p
                className="mb-6 flex-1 text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.65)", fontFamily: '"Lato", sans-serif' }}
              >
                Upload any recorded call. Qube analyzes every moment against a proven sales framework.
              </p>
              <Link
                href="/upload"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-colors"
                style={{ backgroundColor: "#00989E", color: "#FFFFFF", fontFamily: '"Lato", sans-serif' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#00B8BF")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#00989E")}
              >
                Analyze a Call
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Loom Demo Review */}
            <div
              className="flex flex-col rounded-xl p-6"
              style={{ backgroundColor: "#0F0F0F", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3
                  className="text-lg"
                  style={{ color: "#FFFFFF", fontFamily: '"Poppins", sans-serif', fontWeight: 900 }}
                >
                  Loom Demo Review
                </h3>
                <span
                  className="rounded-full px-3 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: "rgba(0,152,158,0.15)", color: "#00989E" }}
                >
                  $30
                </span>
              </div>
              <p
                className="mb-6 flex-1 text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.65)", fontFamily: '"Lato", sans-serif' }}
              >
                Get a personal 5-minute Loom from Jake breaking down exactly what to fix in your demo or sales conversation.
              </p>
              <a
                href="https://calendly.com/jakeweber-hygenieai/15-minute-demo-review"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-colors"
                style={{ backgroundColor: "#00989E", color: "#FFFFFF", fontFamily: '"Lato", sans-serif' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#00B8BF")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#00989E")}
              >
                Get My Loom Review
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* 1:1 Coaching Call */}
            <div
              className="flex flex-col rounded-xl p-6"
              style={{ backgroundColor: "#0F0F0F", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3
                  className="text-lg"
                  style={{ color: "#FFFFFF", fontFamily: '"Poppins", sans-serif', fontWeight: 900 }}
                >
                  1:1 Coaching Call
                </h3>
                <span
                  className="rounded-full px-3 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: "rgba(0,152,158,0.15)", color: "#00989E" }}
                >
                  $75
                </span>
              </div>
              <p
                className="mb-6 flex-1 text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.65)", fontFamily: '"Lato", sans-serif' }}
              >
                30 minutes with Jake live. Go through your calls together and walk away with a clear action plan.
              </p>
              <a
                href="https://calendly.com/jakeweber-hygenieai/30-minute-1-1-coaching-call"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-colors"
                style={{ backgroundColor: "#00989E", color: "#FFFFFF", fontFamily: '"Lato", sans-serif' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#00B8BF")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#00989E")}
              >
                Book a Call
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

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
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: "#0F0F0F", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <h3
                className="mb-3 text-lg"
                style={{ color: "#FFFFFF", fontFamily: '"Poppins", sans-serif', fontWeight: 900 }}
              >
                The pattern behind your symptoms
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.65)", fontFamily: '"Lato", sans-serif' }}
              >
                {pattern}
              </p>
            </div>
          </section>
        )}

        {/* Start over link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "rgba(255,255,255,0.65)", fontFamily: '"Lato", sans-serif' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Start over
          </Link>
        </div>

        {/* Footer */}
        <footer
          className="mt-12 pt-6 text-center text-sm"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)", fontFamily: '"Lato", sans-serif' }}
        >
          &copy; 2025 Hygenie.ai
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
        <main className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#0A0A0A" }}>
          <p style={{ color: "rgba(255,255,255,0.65)", fontFamily: '"Lato", sans-serif' }}>Loading...</p>
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
