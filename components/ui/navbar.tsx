// FILE: components/ui/navbar.tsx  (REPLACE ENTIRE FILE)
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useMemo, useState, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useBooking } from '@/components/ui/booking-provider';

type Tab = { href: string; label: string };

function MobileDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const labelId = useId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    const prev = document.documentElement.style.overflow;
    if (open) document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = prev; };
  }, [open, mounted]);

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          opacity: open ? 1 : 0,
          transition: 'opacity 200ms ease',
          pointerEvents: open ? 'auto' : 'none',
          zIndex: 99998,
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: '80vw',
          maxWidth: 320,
          backgroundColor: 'rgba(203,185,164,0.96)',
          color: '#120D0A',
          WebkitBackdropFilter: 'blur(26px) saturate(125%)',
          backdropFilter: 'blur(26px) saturate(125%)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '0 22px 70px rgba(0,0,0,.28)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 280ms cubic-bezier(.2,.8,.2,1)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem', borderBottom: '1px solid var(--border)',
          }}
        >
          <h2 id={labelId} style={{ fontWeight: 600, margin: 0, fontSize: '1rem' }}>
            Menu
          </h2>
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              height: 36, width: 36, display: 'grid', placeItems: 'center',
              borderRadius: 10, background: 'rgba(18,13,10,0.15)',
              color: '#120D0A', border: '1px solid var(--border)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ padding: '0.75rem', display: 'grid', gap: '0.25rem', flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </aside>
    </>,
    document.body
  );
}

export default function Navbar() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const role = (session?.user as any)?.role ?? 'USER';
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const booking = useBooking();

  // Order + labels per request (Education -> Reviews, add Home first)
  const tabs: Tab[] = useMemo(
    () => [
      { href: '/',           label: 'Home' },
      { href: '/services',   label: 'Services' },
      { href: '/portfolio',  label: 'Portfolio' },
      { href: '/reviews',    label: 'Reviews' },
      { href: '/faq',        label: 'FAQ' },
      { href: '/about',      label: 'About' },
    ],
    []
  );

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const dashboardHref = role === 'ADMIN' ? '/admin' : '/dashboard';

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/65 backdrop-blur">
      <nav className="f-container py-1.5 sm:py-2" aria-label="Primary">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Brand → home */}
          <Link href="/" className="inline-flex items-center" aria-label="Home">
            <Image
              src="/logo.svg"
              alt="Fari Makeup"
              width={320}
              height={140}
              priority
              className="block h-16 w-auto object-contain sm:h-20"
            />
          </Link>

          {/* Desktop tabs (more rectangular glass, slightly larger text) */}
          <div className="hidden lg:flex items-center gap-1">
            <div className="glass-strong rounded-xl px-2 py-1">
              <ul className="flex items-center gap-1">
                {tabs.map((t) => (
                  <li key={t.label}>
                    <Link
                      href={t.href}
                      aria-current={isActive(t.href) ? 'page' : undefined}
                      className={[
                        'inline-flex h-10 items-center rounded-lg px-3 text-[14px] tracking-wide',
                        isActive(t.href)
                          ? 'bg-primary/15 text-foreground border border-border/60'
                          : 'text-foreground/90 hover:bg-accent/15',
                      ].join(' ')}
                    >
                      {t.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {!isLoggedIn ? (
              <Link
                href="/auth/sign-in"
                className="hidden lg:inline-flex h-10 items-center rounded-lg px-3 border border-border/70 bg-card/70 text-foreground hover:bg-accent/15"
              >
                Sign in
              </Link>
            ) : (
              <>
                <Link
                  href={dashboardHref}
                  className="hidden lg:inline-flex h-10 items-center rounded-lg px-3 border border-border/70 bg-card/70 text-foreground hover:bg-accent/15"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="hidden lg:inline-flex h-10 items-center rounded-lg px-3 border border-border/70 bg-card/70 text-foreground hover:bg-accent/15"
                >
                  Log out
                </button>
              </>
            )}

            {/* Global Book NOW */}
            <button
              onClick={() => booking.open()}
              className="inline-flex h-10 items-center rounded-lg px-4 gbtn transition-transform hover:scale-[1.02] active:scale-[0.99] specular"
              type="button"
            >
              Book now
            </button>

            {/* Hamburger (mobile) */}
            <button
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="inline-grid place-items-center lg:hidden h-10 w-10 rounded-xl icon-chip"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <MobileDrawer open={open} onClose={() => setOpen(false)}>
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className={[
              'h-11 rounded-lg px-3 flex items-center',
              isActive(t.href) ? 'bg-primary/15 border border-border/60' : 'hover:bg-accent/20',
            ].join(' ')}
            onClick={() => setOpen(false)}
          >
            {t.label}
          </Link>
        ))}

        <div className="h-px bg-border/70 my-3" />

        {!isLoggedIn ? (
          <Link
            href="/auth/sign-in"
            className="h-11 rounded-lg px-3 flex items-center hover:bg-accent/20"
            onClick={() => setOpen(false)}
          >
            Sign in
          </Link>
        ) : (
          <>
            <Link
              href={dashboardHref}
              className="h-11 rounded-lg px-3 flex items-center hover:bg-accent/20"
              onClick={() => setOpen(false)}
            >
              Dashboard
            </Link>
            <button
              className="h-11 rounded-lg px-3 text-left hover:bg-accent/20"
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: '/' });
              }}
            >
              Log out
            </button>
          </>
        )}

        <div className="mt-3">
          <button
            onClick={() => { setOpen(false); booking.open(); }}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg gbtn transition-transform hover:scale-[1.02] active:scale-[0.99] specular"
            type="button"
          >
            Book now
          </button>
        </div>
      </MobileDrawer>
    </header>
  );
}
