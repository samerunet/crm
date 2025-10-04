"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");     // required
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!/^\+?[0-9\s\-().]{7,}$/.test(phone)) {
      setErr("Please enter a valid phone number (include country code if possible).");
      return;
    }
    if (pw.length < 8 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) {
      setErr("Password must be at least 8 chars and include a capital letter and a number.");
      return;
    }
    if (pw !== pw2) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password: pw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Registration failed");

      // auto sign-in after register
      const signed = await signIn("credentials", {
        email,
        password: pw,
        redirect: false,
        callbackUrl,
      });
      if (signed?.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        router.push("/auth/sign-in?callbackUrl=" + encodeURIComponent(callbackUrl));
      }
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="f-container py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl glass specular p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Clients get access to their purchases & booking.</p>

        <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-1">
            <span className="text-sm">Full name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-border bg-card/60 px-3 py-2 outline-none focus:ring-2 focus:ring-[--ring]"
              placeholder="Jane Doe"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Phone (required)</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-lg border border-border bg-card/60 px-3 py-2 outline-none focus:ring-2 focus:ring-[--ring]"
              placeholder="+1 555 123 4567"
              required
              inputMode="tel"
              autoComplete="tel"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-border bg-card/60 px-3 py-2 outline-none focus:ring-2 focus:ring-[--ring]"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Password</span>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="w-full rounded-lg border border-border bg-card/60 px-3 py-2 pr-11 outline-none focus:ring-2 focus:ring-[--ring]"
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-0 my-[3px] mr-[3px] rounded-md border border-border bg-card/70 px-2 text-xs text-foreground/80 hover:bg-accent/15"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Confirm password</span>
            <input
              type={showPw ? "text" : "password"}
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              className="rounded-lg border border-border bg-card/60 px-3 py-2 outline-none focus:ring-2 focus:ring-[--ring]"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </label>

          {err && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {err}
            </div>
          )}

          <button
            disabled={loading}
            className="mt-1 rounded-xl bg-primary px-4 py-2 text-primary-foreground font-medium shadow hover:bg-accent transition disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/auth/sign-in" className="underline underline-offset-4">Already have an account?</Link>
          <Link href="/auth/forgot" className="text-muted-foreground hover:underline">Forgot password?</Link>
        </div>
      </div>
    </main>
  );
}
