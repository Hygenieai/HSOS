"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navigation } from "@/components/Navigation";

export default function DemoReviewPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="animate-fade-up mb-10">
            <h1 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Demo Review
            </h1>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
              Choose how you want your demo reviewed.
            </p>
          </div>

          {/* Cards */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Loom Review */}
            <div className="flex flex-col rounded-xl border border-border bg-[#0A0A0A] p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-[family-name:var(--font-poppins)] text-lg font-bold text-foreground">
                  Loom Review
                </h3>
                <span className="rounded-full bg-primary/15 px-3 py-0.5 text-xs font-semibold text-[#00989E]">
                  FROM $30
                </span>
              </div>
              <p className="mb-6 flex-1 font-[family-name:var(--font-lato)] text-sm leading-relaxed text-muted-foreground">
                Upload your demo. Jake reviews it personally and sends back a Loom.
              </p>
              <a
                href="https://calendly.com/jakeweber-hygenieai/15-minute-demo-review"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#00989E] px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-[#00c4d6]"
              >
                Book a Review
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Live Call */}
            <div className="flex flex-col rounded-xl border border-border bg-[#0A0A0A] p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-[family-name:var(--font-poppins)] text-lg font-bold text-foreground">
                  Live Coaching Call
                </h3>
                <span className="rounded-full bg-primary/15 px-3 py-0.5 text-xs font-semibold text-[#00989E]">
                  1:1
                </span>
              </div>
              <p className="mb-6 flex-1 font-[family-name:var(--font-lato)] text-sm leading-relaxed text-muted-foreground">
                Book a 30-minute 1:1 coaching call with Jake.
              </p>
              <a
                href="https://calendly.com/jakeweber-hygenieai/30-minute-1-1-coaching-call"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#00989E] px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-[#00c4d6]"
              >
                Book a Call
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to Symptom Engine
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
