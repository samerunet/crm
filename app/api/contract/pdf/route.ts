import { NextRequest } from "next/server";

import { renderHollywoodStyleContract } from "@/components/admin/contractTemplates";
import { getBrowser } from "@/lib/pdfBrowser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { lead, options } = await req.json();
    const htmlInner = renderHollywoodStyleContract(lead, {
      ...(options || {}),
      fillable: false,
    } as any);

    const html = [
      "<!doctype html>",
      "<html>",
      "<head>",
      '<meta charset="utf-8"/>',
      '<meta name="viewport" content="width=device-width,initial-scale=1"/>',
      "<style>@page{size:Letter;margin:0.5in}html,body{margin:0}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style>",
      "</head>",
      "<body>",
      htmlInner,
      "</body>",
      "</html>",
    ].join("");

    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.emulateMediaType("screen");

    const pdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
    });

    await page.close();
    await browser.close();

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="contract.pdf"',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message ?? "PDF error" }),
      { status: 500 },
    );
  }
}
