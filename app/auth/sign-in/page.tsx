"use client";
import { motion } from "framer-motion";

export default function SignInPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-semibold mb-6">Sign in</h1>
      <div className="space-y-3">
        <motion.button whileTap={{ scale: 0.98 }} className="w-full rounded-md border border-white/20 bg-white/10 px-4 py-2">
          Continue with Google
        </motion.button>
        <motion.button whileTap={{ scale: 0.98 }} className="w-full rounded-md border border-white/20 bg-white/10 px-4 py-2">
          Continue with Apple
        </motion.button>
        <p className="text-xs text-white/60 mt-3">Auth wiring TBD (Auth.js / next-auth). This is a placeholder UI.</p>
      </div>
    </main>
  );
}
