// FILE: components/admin/TopBar.tsx  (DROP-IN)
// Glass left-rail + responsive top bar

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = { href: string; label: string };

const NAV: NavItem[] = [
  { href: "/admin",       label: "Overview" },
  { href: "/admin#cal",   label: "Calendar" },
  { href: "/admin#leads", label: "Leads" },
  { href: "/admin#content", label: "Content" },
];

export default function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : false;

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 glass-strong border-b border-border/60">
        <div className="f-container flex items-center justify-between py-2">
          <div className="font-semibold">Admin</div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="icon-chip h-10 w-10 rounded-xl inline-grid place-items-center"
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
        {open && (
          <div className="px-3 pb-3">
            <nav className="glass rounded-2xl p-2">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={`block h-10 rounded-xl px-3 leading-10 ${
                    isActive(n.href)
                      ? "bg-primary/15 border border-border/60"
                      : "hover:bg-accent/20"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Desktop left rail */}
      <aside className="hidden lg:block sticky top-20 self-start w-[220px]">
        <div className="glass-strong rounded-2xl p-2">
          <div className="px-2 py-2 text-sm font-semibold opacity-80">Navigation</div>
          <nav className="grid gap-1 px-2 pb-2">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`h-10 rounded-xl px-3 flex items-center border transition ${
                  isActive(n.href)
                    ? "bg-primary/15 border-border/70"
                    : "border-transparent hover:bg-accent/20"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
