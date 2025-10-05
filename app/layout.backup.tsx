// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { BookingProvider } from "@/components/ui/booking-provider";

export const metadata: Metadata = {
  title: "Fari Makeup — Bridal Makeup & Courses",
  description: "Timeless bridal looks. Portfolio, courses, and booking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="fari-light" suppressHydrationWarning>
      <body>
        <BookingProvider>
          <Navbar />
          {children}
          <Footer />
        </BookingProvider>
      </body>
    </html>
  );
}
