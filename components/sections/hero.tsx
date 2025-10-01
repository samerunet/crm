"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 md:pt-24">
      <p className="text-sm tracking-wide text-white/70">WEDDING MAKEUP</p>
      <h1 className="mt-2 text-4xl md:text-6xl font-semibold leading-tight tracking-tight">
        Timeless bridal looks
        <span className="block bg-clip-text text-transparent [background-image:linear-gradient(90deg,#fff,rgba(255,255,255,0.55))]">
          that photograph beautifully
        </span>
      </h1>
      <p className="mt-4 max-w-2xl text-balance text-base text-white/80 md:text-lg">
        See real weddings, read the guide, and book with confidence.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a href="/portfolio" className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/20 transition">
          View portfolio
        </a>
        <a href="/guides" className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium opacity-80 hover:opacity-100 transition">
          Bridal guide
        </a>
      </div>
    </section>
  );
}
