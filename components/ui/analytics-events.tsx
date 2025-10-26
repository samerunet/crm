"use client";

import { useEffect } from "react";

function trackEvent(event: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("event", event, params ?? {});
  } else if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event,
      ...params,
    });
  }
}

export default function AnalyticsEvents() {
  useEffect(() => {
    const ctaNodes = Array.from(
      document.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>("a, button"),
    );

    const listeners: Array<{ el: Element; handler: EventListener }> = [];

    const attach = (
      el: Element,
      eventName: string,
      predicate?: (node: Element) => boolean,
    ) => {
      if (predicate && !predicate(el)) return;
      const handler = () => trackEvent(eventName, { href: (el as HTMLAnchorElement).href });
      el.addEventListener("click", handler, { passive: true });
      listeners.push({ el, handler });
    };

    const includesText = (node: Element, needles: string[]) => {
      const text = node.textContent?.toLowerCase() ?? "";
      return needles.some((needle) => text.includes(needle));
    };

    ctaNodes.forEach((node) => {
      attach(node, "book_trial_click", (el) =>
        includesText(el, ["book", "trial"]),
      );
      attach(node, "call_click", (el) =>
        el instanceof HTMLAnchorElement && el.href.startsWith("tel:"),
      );
      attach(node, "whatsapp_click", (el) =>
        el instanceof HTMLAnchorElement && /(?:wa\.me|whatsapp)/i.test(el.href),
      );
    });

    return () => {
      listeners.forEach(({ el, handler }) => el.removeEventListener("click", handler));
    };
  }, []);

  return null;
}
