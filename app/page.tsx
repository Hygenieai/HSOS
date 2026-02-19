"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { scenarios } from "@/lib/scenarios";
import { Navigation } from "@/components/Navigation";

const MAX_SELECTIONS = 3;

export default function SelectionPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>([]);

  function toggle(id: number) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= MAX_SELECTIONS) return prev;
      return [...prev, id];
    });
  }

  function handleSubmit() {
    if (selected.length === 0) return;
    
    // Save to localStorage
    localStorage.setItem(
      "hsos_diagnostic",
      JSON.stringify({ selected, timestamp: Date.now() })
    );

    // Navigate
    const params = new URLSearchParams();
    params.set("s", selected.join(","));
    router.push(`/results?${params.toString()}`);
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl">

        {/* Hero */}
        <div className="animate-fade-up mb-12 text-center">
          <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {"What's breaking in your sales process right now?"}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {"Select the scenarios that match your current sales reality. The system will identify the structural cause."}
          </p>
        </div>

        {/* Scenario Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario, i) => {
            const isSelected = selected.includes(scenario.id);
            const isDisabled = !isSelected && selected.length >= MAX_SELECTIONS;

            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => toggle(scenario.id)}
                disabled={isDisabled}
                className={`animate-card-in group relative flex flex-col rounded-xl border p-5 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:-translate-y-0.5 hover:border-muted-foreground/30"
                } ${isDisabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Checkmark */}
                {isSelected && (
                  <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}

                <span className="pr-6 text-lg font-bold leading-snug text-white">
                  {`"${scenario.label}"`}
                </span>
                <span className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {scenario.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selection counter + CTA */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {selected.length} of {MAX_SELECTIONS} selected
          </span>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={selected.length === 0}
            className={`inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-bold transition-all ${
              selected.length > 0
                ? "bg-[#F4845F] text-white hover:bg-[#e6734e]"
                : "cursor-not-allowed bg-muted text-muted-foreground opacity-50"
            }`}
          >
            {"Show Me What's Broken"}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          &copy; 2025 Hygenie.SOS
        </footer>
        </div>
      </div>
    </main>
  );
}
