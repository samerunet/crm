import 'react-big-calendar/lib/css/react-big-calendar.css'
// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import AppProviders from "@/components/ui/app-providers";

export const metadata: Metadata = {
  title: "Fari Makeup — Bridal Makeup & Courses",
  description: "Timeless bridal looks. Portfolio, courses, and booking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="fari-light" suppressHydrationWarning>
      <body>
        <AppProviders>
          <Navbar />
          {children}
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
