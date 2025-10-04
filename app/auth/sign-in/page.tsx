// app/auth/sign-in/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";

  // Prefill for quick testing (change/remove as you like)
  const [email, setEmail] = useState("admin@fari.makeup");
  const [password, setPassword] = useState("Admin123!");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <main className="f-container py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl glass specular p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use the test accounts you seeded or your own credentials.
        </p>

        <form
          className="mt-5 grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setErr(null);
            const res = await signIn("credentials", {
              email,
              password,
              redirect: false,
              callbackUrl,
            });
            setLoading(false);
            if (res?.ok) {
              router.push(callbackUrl);
              router.refresh();
            } else {
              setErr("Invalid email or password");
            }
          }}
        >
          <label className="grid gap-1">
            <span className="text-sm">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-border bg-card/60 px-3 py-2 outline-none focus:ring-2 focus:ring-[--ring]"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Password</span>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-card/60 px-3 py-2 pr-11 outline-none focus:ring-2 focus:ring-[--ring]"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowPw((s) => !s)}
                aria-pressed={showPw}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 my-[3px] mr-[3px] inline-flex items-center justify-center rounded-md border border-border bg-card/70 px-2 text-xs text-foreground/80 hover:bg-accent/15"
              >
                {showPw ? "Hide" : "Show"}
              </motion.button>
            </div>
          </label>

          {err && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {err}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="mt-1 rounded-xl bg-primary px-4 py-2 text-primary-foreground font-medium shadow hover:bg-accent transition disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </motion.button>
        </form>

        <div className="mt-6 grid gap-2 text-xs text-muted-foreground">
          <p>
            Admin: <code>admin@fari.makeup / Admin123!</code>
          </p>
          <p>
            Client: <code>client@fari.makeup / Client123!</code>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/" className="underline underline-offset-4">
            ← Back home
          </Link>
          <Link href="/login" className="text-muted-foreground hover:underline">
            Use /login alias
          </Link>
        </div>
      </div>
    </main>
  );
}
