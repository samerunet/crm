"use client";

import { motion } from "framer-motion";
import { FormEvent, Suspense, useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function SignInForm() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!res || res.error) {
      setErr("Invalid email or password.");
      setLoading(false);
      return;
    }

    // fetch session to read the role placed there by callbacks
    const session = await getSession();
    const role = (session?.user as any)?.role ?? "USER";

    // if a callbackUrl was provided, prefer that (e.g., came from a protected page)
    const cb = params.get("callbackUrl");
    if (cb) {
      router.replace(cb);
      router.refresh();
      return;
    }

    // role-based default landing
    router.replace(role === "ADMIN" ? "/admin" : "/dashboard");
    router.refresh();
  }

  return (
    <main className="f-container py-16">
      <div className="glass specular mx-auto max-w-md rounded-2xl p-6 sm:p-7">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid gap-1.5">
            <label htmlFor="email" className="text-sm">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-lg border border-border bg-card/70 px-3 py-2 backdrop-blur"
              placeholder="you@example.com"
            />
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm">Password</label>
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="text-xs opacity-80 hover:opacity-100"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              required
              className="rounded-lg border border-border bg-card/70 px-3 py-2 backdrop-blur"
              placeholder="••••••••"
            />
          </div>

          {err && <p className="text-sm text-red-500">{err}</p>}

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-accent transition disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </motion.button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <a href="/auth/forgot" className="opacity-80 hover:opacity-100">Forgot password?</a>
          <a href="/auth/sign-up" className="opacity-80 hover:opacity-100">Create account</a>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<main className="f-container py-16">Loading…</main>}>
      <SignInForm />
    </Suspense>
  );
}
