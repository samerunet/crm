"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/courses", label: "Courses" },
  { href: "/guides", label: "Guides" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <div className="sticky top-4 z-50 flex justify-center px-4">
      <nav className="flex w-full max-w-5xl items-center justify-between rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur">
        <Link href="/" className="font-medium tracking-tight">Makeup Artist</Link>
        <div className="flex items-center gap-4 text-sm">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`opacity-90 transition hover:opacity-100 ${pathname === l.href ? "underline" : ""}`}>
              {l.label}
            </Link>
          ))}
          <Link href="/auth/sign-in" className="rounded-full border border-white/20 px-3 py-1 opacity-90 transition hover:opacity-100">
            Sign in
          </Link>
        </div>
      </nav>
    </div>
  );
}
