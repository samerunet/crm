// components/ui/app-providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { BookingProvider } from "./booking-provider";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <BookingProvider>{children}</BookingProvider>
    </SessionProvider>
  );
}
