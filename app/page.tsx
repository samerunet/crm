"use client";
import { motion } from "framer-motion";
import Hero from "@/components/sections/hero";
import ShowcaseGrid from "@/components/sections/showcase-grid";
import CTASection from "@/components/sections/cta-section";

export default function Page() {
  return (
    <main>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Hero />
      </motion.div>
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <ShowcaseGrid />
      </section>
      <CTASection />
    </main>
  );
}
