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
            <a
              href="mailto:jake@hygenieai.com?subject=Demo Review Request"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Demo Review
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
