export const GUIDE_PRODUCT = {
  slug: "makeup-guide",
  title: "Makeup Kit Guide by Fari",
  shortTitle: "Makeup Guide",
  eyebrow: "Digital Guide",
  priceCents: 2999,
  priceLabel: "$29.99",
  coverImageSrc: "/images/guides/makeup-kit-guide-by-fari-cover.png",
  checkoutPath: "/pay/guide",
  pdfStoragePath: "content/guides/MAKE-UP-KIT-GUIDE-BY-FARI.pdf",
  downloadFilename: "MAKE-UP-KIT-GUIDE-BY-FARI.pdf",
  description:
    "A polished digital guide for building a cleaner, smarter, more reliable makeup kit with the product categories, essentials, and selection logic Fari uses in her workflow.",
  body:
    "Designed for beauty lovers, aspiring artists, and anyone refining their personal or professional kit, this guide organizes what to buy, what matters most, and how to think through a makeup kit that feels intentional instead of random.",
  bullets: [
    "A curated breakdown of core kit categories and must-have essentials",
    "Clear guidance for building a practical kit without overbuying",
    "A polished visual PDF you can save, revisit, and shop from",
  ],
  includes: [
    "53-page digital PDF",
    "Kit-building guidance you can reference anytime",
    "Instant email delivery after successful payment",
  ],
} as const;

export function formatGuidePrice(priceCents = GUIDE_PRODUCT.priceCents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);
}
