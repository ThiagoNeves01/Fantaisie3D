// Capturas de tela para revisão visual. Uso: node scripts/shot.mjs <path> <saida.png> [mobile] [full]
import { chromium } from "playwright";
const [, , path = "/br", out = "/tmp/shot.png", mode = "desktop", full = "full"] = process.argv;
const browser = await chromium.launch();
const ctx = await browser.newContext(
  mode === "mobile"
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { viewport: { width: 1440, height: 900 } },
);
const page = await ctx.newPage();
page.on("pageerror", (e) => console.error("[pageerror]", e.message));
page.on("console", (m) => m.type() === "error" && console.error("[console]", m.text().slice(0, 300)));
await page.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
if (full === "full") {
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 700) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(120); }
  await page.evaluate(() => window.scrollTo(0, 0));
}
await page.waitForTimeout(1500);
await page.screenshot({ path: out, fullPage: full === "full" });
await browser.close();
