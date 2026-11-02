// Gera as fotos dos produtos de demonstração (renderização 3D com three.js em Chromium headless).
// Uso: node scripts/render/render.mjs [jobs.json] [--only=kind]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const threeDir = path.join(root, "node_modules/three");
const jobsFile = process.argv[2] ?? path.join(here, "jobs.json");
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
const { products = [], heroes = [] } = JSON.parse(fs.readFileSync(jobsFile, "utf8"));

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  let file = url === "/" ? path.join(here, "scene.html") : url.startsWith("/three/") ? path.join(threeDir, url.slice(7)) : null;
  if (!file || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": file.endsWith(".js") ? "text/javascript" : "text/html" });
  fs.createReadStream(file).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1200, height: 1200 } });
page.on("console", (m) => m.type() === "error" && console.error("[page]", m.text()));
page.on("pageerror", (e) => console.error("[pageerror]", e.message));
await page.goto(`http://localhost:${port}/`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 60000 });

async function save(dataUrl, out, w, h, bg) {
  const buf = Buffer.from(dataUrl.split(",")[1], "base64");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  let img = sharp(buf);
  if (bg) img = img.flatten({ background: bg });
  if (w) img = img.resize(w, h ?? w);
  await img.webp({ quality: 86 }).toFile(out);
}

for (const p of products) {
  if (only && p.kind !== only && p.slug !== only) continue;
  const views = p.views ?? [{ angle: 0.55, elev: 0.3 }, { angle: -0.7, elev: 0.22 }, { angle: 0.1, elev: 0.75 }];
  for (let i = 0; i < views.length; i++) {
    const v = views[i];
    const url = await page.evaluate((args) => window.renderProduct(args), { kind: p.kind, colors: p.colors, bg: p.bg ?? "light", ...v });
    const out = path.join(root, "public/products", `${p.slug}-${i + 1}.webp`);
    await save(url, out, 1000, 1000, (p.bg ?? "light") === "dark" ? "#16181b" : "#F1F1F3");
    console.log("✓", out.replace(root + "/", ""));
  }
}
for (const h of heroes) {
  if (only && h.name !== only) continue;
  const url = await page.evaluate(([items, opts]) => window.renderHero(items, opts), [h.items, h.opts ?? {}]);
  const out = path.join(root, "public/images", `${h.name}.webp`);
  await save(url, out, h.opts?.w ?? 1920, h.opts?.h ?? 1080, "#101113");
  console.log("✓", out.replace(root + "/", ""));
}
await browser.close();
server.close();
