// components/ui/navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useBooking } from "./booking-provider";

const links = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/services", label: "Services" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const booking = useBooking();

  // close mobile sheet on route change or ESC
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/65 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="text-lg font-semibold tracking-tight md:text-xl">
          Fari Makeup
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 text-sm md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={[
                "rounded-xl border border-transparent px-2 py-1 transition",
                "hover:bg-card/70 hover:border-border hover:backdrop-blur",
                pathname === l.href ? "underline underline-offset-4" : "opacity-80 hover:opacity-100",
              ].join(" ")}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={() => booking.open({ id: "general", title: "General Inquiry" })}
            className="rounded-xl border border-border bg-foreground/90 px-3 py-1.5 text-sm font-medium text-background shadow transition hover:bg-foreground"
          >
            Book Now
          </button>
        </nav>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => booking.open({ id: "general", title: "General Inquiry" })}
            className="rounded-lg border border-border bg-foreground/90 px-2.5 py-1 text-xs font-medium text-background shadow"
          >
            Book
          </button>
          <button
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="rounded-lg border border-border bg-card/70 px-2.5 py-1 text-sm shadow"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile glass sheet */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 md:hidden"
          onClick={(e) => e.target === e.currentTarget && setMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div
            ref={sheetRef}
            className="glass fixed inset-x-3 top-3 rounded-2xl p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-medium">Menu</span>
              <button
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg border border-border bg-card/70 px-2.5 py-1 text-sm"
              >
                ✕
              </button>
            </div>
            <nav className="mt-2 grid gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={[
                    "rounded-lg px-3 py-3 text-[15px] transition",
                    "hover:bg-accent/15",
                    pathname === l.href ? "bg-accent/20" : "",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  booking.open({ id: "general", title: "General Inquiry" });
                }}
                className="mt-1 rounded-lg bg-primary px-3 py-3 text-left text-[15px] font-medium text-primary-foreground"
              >
                Book Now
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
