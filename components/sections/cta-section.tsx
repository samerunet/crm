"use client";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <motion.div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center"
        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ amount: 0.4 }}>
        <h2 className="text-2xl md:text-3xl font-semibold">Book your date</h2>
        <p className="mt-2 text-white/80">Limited availability for peak wedding season.</p>
        <div className="mt-6 flex justify-center">
          <a href="/auth/sign-in" className="rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-medium hover:bg-white/20 transition">
            Start booking
          </a>
        </div>
      </motion.div>
    </section>
  );
}
