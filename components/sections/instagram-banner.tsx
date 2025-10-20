"use client";
import Link from "next/link";

export default function InstagramBanner({
  username = "fari_makeup",
}: {
  username?: string;
}) {
  return (
    <div className="specular glass rounded-[14px] p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm sm:text-base">See recent work on Instagram</p>
      <Link
        href={`https://www.instagram.com/${username}/`}
        target="_blank"
        className="rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-accent/15"
      >
        @{username}
      </Link>
    </div>
  );
}
