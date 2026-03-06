"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/call"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Live Coaching
            </Link>
            <Link
              href="/upload"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/upload"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Call Analysis
            </Link>
            <Link
              href="/demo-review"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/demo-review"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Demo Review
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
