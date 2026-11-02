import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

/**
 * Validação de uploads por extensão, tamanho e assinatura binária (magic bytes).
 * Arquivos ficam fora de /public (UPLOAD_DIR, padrão ./storage). Para produção, troque
 * saveUpload por Supabase Storage com bucket privado (ver README).
 */
const IMAGE_MAX = 8 * 1024 * 1024;
const MODEL_MAX = 25 * 1024 * 1024;

export async function validateUpload(file: File, kind: "image" | "model"):
  Promise<{ ok: true; ext: string; mime: string } | { ok: false; error: "type" | "size" }> {
  const ext = path.extname(file.name).toLowerCase().replace(".", "");
  const max = kind === "image" ? IMAGE_MAX : MODEL_MAX;
  if (file.size > max) return { ok: false, error: "size" };
  const head = new Uint8Array(await file.slice(0, 96).arrayBuffer());
  const startsWith = (sig: number[], offset = 0) => sig.every((b, i) => head[offset + i] === b);

  if (kind === "image") {
    if ((ext === "jpg" || ext === "jpeg") && startsWith([0xff, 0xd8, 0xff])) return { ok: true, ext: "jpg", mime: "image/jpeg" };
    if (ext === "png" && startsWith([0x89, 0x50, 0x4e, 0x47])) return { ok: true, ext: "png", mime: "image/png" };
    if (ext === "webp" && startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) return { ok: true, ext: "webp", mime: "image/webp" };
    return { ok: false, error: "type" };
  }
  // 3MF é um ZIP; STL pode ser ASCII ("solid") ou binário (cabeçalho de 80 bytes + contagem de triângulos)
  if (ext === "3mf" && startsWith([0x50, 0x4b, 0x03, 0x04])) return { ok: true, ext: "3mf", mime: "model/3mf" };
  if (ext === "stl") {
    const ascii = new TextDecoder().decode(head.slice(0, 5)).toLowerCase() === "solid";
    if (ascii) return { ok: true, ext: "stl", mime: "model/stl" };
    if (file.size >= 84) {
      const buf = new DataView(await file.slice(80, 84).arrayBuffer());
      const tris = buf.getUint32(0, true);
      if (84 + tris * 50 === file.size) return { ok: true, ext: "stl", mime: "model/stl" };
    }
  }
  return { ok: false, error: "type" };
}

export async function saveUpload(file: File, folder: string, ext: string) {
  const base = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "storage");
  const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, "");
  const dir = path.join(base, safeFolder);
  await mkdir(dir, { recursive: true });
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return path.posix.join(safeFolder, name);
}
