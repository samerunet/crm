"use client";

import { useBooking } from "@/components/ui/booking-provider";

export default function FaqCta() {
  const { open } = useBooking();

  return (
    <button
      type="button"
      onClick={() => open()}
      className="font-medium underline underline-offset-4 hover:no-underline"
    >
      Ready to inquire? Check availability →
    </button>
  );
}
