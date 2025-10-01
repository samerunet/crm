"use client";
import { motion } from "framer-motion";

export default function ShowcaseGrid() {
  const items = Array.from({ length: 6 }).map((_, i) => ({
    title: `Wedding ${i + 1}`,
  }));

  return (
    <motion.ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" initial="hidden" animate="show">
      {items.map((it, i) => (
        <motion.li key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.4 }} transition={{ duration: 0.45 }}>
          <a href="/portfolio" className="block">
            <div className="aspect-[4/3] rounded-2xl border border-white/10 bg-white/5" />
            <h3 className="mt-2 font-medium">{it.title}</h3>
          </a>
        </motion.li>
      ))}
    </motion.ul>
  );
}
