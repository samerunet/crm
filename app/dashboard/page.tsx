"use client";
import { motion } from "framer-motion";

export default function Dashboard() {
  const cards = [
    { label: "Revenue (30d)", value: "$0.00" },
    { label: "Active learners", value: "0" },
    { label: "Conversion rate", value: "0%" },
  ];
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl md:text-4xl font-semibold mb-6">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <motion.div key={c.label} className="rounded-2xl border border-white/10 bg-white/5 p-5"
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ amount: 0.5 }}>
            <div className="text-sm text-white/70">{c.label}</div>
            <div className="text-2xl font-semibold mt-1">{c.value}</div>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold mb-2">Engagement</h2>
        <p className="text-white/70 text-sm">Charts & cohort analysis coming soon.</p>
      </div>
    </main>
  );
}
