// app/services/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services — Fari Makeup",
  description:
    "Luxury bridal makeup services in San Diego, OC, and LA. Bridal trials, wedding-day makeup, bridal party, and on-location touch-ups.",
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
