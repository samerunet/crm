"use client";
import { motion } from "framer-motion";

export default function Page() {
  const items = Array.from({ length: 6 }).map((_, i) => ({
    title: `Wedding ${i + 1}`,
    img: `/placeholder/${i+1}.jpg`,
  }));
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl md:text-4xl font-semibold mb-6">Weddings</h1>
      <motion.ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" initial="hidden" animate="show">
        {items.map((it, i) => (
          <motion.li key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }} transition={{ duration: 0.45 }}>
            <div className="aspect-[4/3] rounded-2xl border border-white/10 bg-white/5" />
            <h3 className="mt-2 font-medium">{it.title}</h3>
          </motion.li>
        ))}
      </motion.ul>
    </main>
  );
}
