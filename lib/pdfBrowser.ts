import chromium from "@sparticuz/chromium";
import type { Browser } from "puppeteer-core";

export async function getBrowser(): Promise<Browser> {
  const isServerless = Boolean(
    process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.VERCEL,
  );

  if (isServerless) {
    const puppeteer = await import("puppeteer-core");
    const executablePath = await chromium.executablePath();

    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
  }

  const puppeteer = await import("puppeteer");
  return puppeteer.default.launch({ headless: "new" });
}
