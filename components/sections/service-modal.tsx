"use client";

import Image from "next/image";

export default function ServiceModal({
  open,
  onClose,
  title,
  image,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  image: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="glass-2 specular w-full max-w-2xl rounded-2xl border border-border/70 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border/70">
                <Image src={image} alt={title} fill className="object-cover" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-lg border border-border/70 bg-card/80 hover:bg-accent/20"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 text-sm leading-6 text-foreground/90">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
