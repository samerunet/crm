// components/ui/app-providers.tsx
"use client";

import type { ReactNode } from "react";

import { SessionProvider } from "next-auth/react";

import { BookingProvider } from "./booking-provider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <BookingProvider>{children}</BookingProvider>
    </SessionProvider>
  );
}
