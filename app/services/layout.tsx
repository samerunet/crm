// app/services/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Services — Fari Makeup",
  description:
    "Luxury bridal makeup services in San Diego, OC, and LA. Bridal trials, wedding-day makeup, bridal party, and on-location touch-ups.",
};

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return children;
}
