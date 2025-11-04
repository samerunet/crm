"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type FaqCategory =
  | "booking"
  | "services"
  | "travel"
  | "timing"
  | "payments"
  | "prep"
  | "policies"
  | "education";

export type FaqItem = {
  q: string;
  a: string;
  category: FaqCategory;
};

type Props = {
  faqs: FaqItem[];
  sectionOrder: FaqCategory[];
  sectionLabels: Record<FaqCategory, string>;
};

type QuestionEntry = FaqItem & { id: string };

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function FaqInteractive({ faqs, sectionOrder, sectionLabels }: Props) {
  const questionEntries: QuestionEntry[] = useMemo(
    () =>
      faqs.map((item, index) => ({
        ...item,
        id: `faq-${index}-${slugify(item.q)}`,
      })),
    [faqs],
  );

  const [openId, setOpenId] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  const categoryAnchors: Record<FaqCategory, string | undefined> = useMemo(() => {
    const map: Record<FaqCategory, string | undefined> = {
      booking: undefined,
      services: undefined,
      travel: undefined,
      timing: undefined,
      payments: undefined,
      prep: undefined,
      policies: undefined,
      education: undefined,
    };
    questionEntries.forEach((entry) => {
      if (!map[entry.category]) {
        map[entry.category] = entry.id;
      }
    });
    return map;
  }, [questionEntries]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const direct = refs.current[hash];
    if (direct) {
      setOpenId(hash);
      window.requestAnimationFrame(() => {
        direct.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }
    const categoryMatch = categoryAnchors[hash as FaqCategory];
    if (categoryMatch) {
      focusQuestion(categoryMatch, true);
    }
  }, [categoryAnchors, questionEntries]);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const focusQuestion = (id: string, updateHash = false) => {
    setOpenId(id);
    if (updateHash && typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
    window.requestAnimationFrame(() => {
      refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleChipClick = (category: FaqCategory) => {
    const match = questionEntries.find((entry) => entry.category === category);
    if (match) {
      focusQuestion(match.id, true);
    }
  };

  return (
    <>
      <div className="mt-5 flex flex-wrap gap-2">
        {sectionOrder.map((section) => {
          const target = categoryAnchors[section];
          if (!target) return null;
          return (
            <button
              key={section}
              type="button"
              className="ios-chip inline-flex h-8 items-center rounded-xl px-3 text-sm"
              onClick={() => handleChipClick(section)}
            >
              {sectionLabels[section]}
            </button>
          );
        })}
      </div>

      <section className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2">
        {questionEntries.map(({ id, q, a, category }) => {
          const isOpen = openId === id;
          return (
            <article
              key={id}
              id={id}
              ref={(node) => {
                refs.current[id] = node;
              }}
              className="glass rounded-[--radius-xl] border border-[--color-border]/60 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
            >
              <button
                type="button"
                onClick={() => handleToggle(id)}
                className="flex w-full items-center justify-between gap-3 text-left"
                aria-expanded={isOpen}
                aria-controls={`${id}-answer`}
              >
                <span className="text-lg font-semibold text-[--color-foreground]">{q}</span>
                <span className="icon-chip rounded-[--radius-md] px-2 py-1 text-xs text-[--color-muted-foreground]">
                  {isOpen ? "–" : "+"}
                </span>
              </button>
              <div
                id={`${id}-answer`}
                className={`mt-3 text-sm leading-relaxed text-[--color-muted-foreground] transition-[max-height,opacity] duration-200 ease-out ${
                  isOpen
                    ? "max-h-[600px] opacity-100"
                    : "max-h-0 overflow-hidden opacity-0"
                }`}
              >
                <p className="[&:not(:last-child)]:mb-2">{a}</p>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
