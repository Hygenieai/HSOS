"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic2, Home } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-foreground hover:text-primary transition-colors"
          >
            Hygenie<span className="text-primary">.SOS</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className={`inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/" || pathname === "/results"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/" || pathname === "/results"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Symptom Engine
            </Link>
            <Link
              href="/call"
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                pathname === "/call"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary hover:bg-primary/5"
              }`}
            >
              <Mic2 className="h-4 w-4" />
              Live Coaching
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
