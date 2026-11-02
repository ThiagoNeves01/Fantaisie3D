"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { fmt } from "@/i18n";

type Img = { url: string; alt: string };

export function ProductGallery({ images, videoUrl, children }: { images: Img[]; videoUrl?: string | null; children?: React.ReactNode }) {
  const { m } = useI18n();
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [hoverZoom, setHoverZoom] = useState(false);
  const n = images.length;
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [zoom, go]);

  if (!n) return <div className="plate aspect-square" />;
  const cur = images[i];

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row" aria-label={m.product.gallery} role="region">
      {n > 1 && (
        <ul className="flex gap-2.5 lg:flex-col" role="tablist" aria-label={m.product.gallery}>
          {images.map((img, idx) => (
            <li key={img.url}>
              <button type="button" role="tab" aria-selected={idx === i} aria-label={fmt(m.product.image, { n: idx + 1, total: n })}
                onClick={() => setI(idx)}
                className={`relative block h-[4.5rem] w-[4.5rem] overflow-hidden rounded-2xl bg-metal ring-2 transition ${idx === i ? "ring-ink" : "ring-transparent hover:ring-ink/20"}`}>
                <Image src={img.url} alt="" fill sizes="72px" className="object-cover" />
              </button>
            </li>
          ))}
          {videoUrl && (
            <li><a href={videoUrl} target="_blank" rel="noopener noreferrer" className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-ink text-xs text-metal">{m.product.video}</a></li>
          )}
        </ul>
      )}
      <div className="plate group relative aspect-square flex-1 cursor-zoom-in"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
        }}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHoverZoom(true)}
        onPointerLeave={() => setHoverZoom(false)}
        onClick={() => setZoom(true)}>
        <Image src={cur.url} alt={cur.alt} fill priority sizes="(min-width:1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-200 ease-out"
          style={{ transformOrigin: origin, transform: hoverZoom ? "scale(1.7)" : "scale(1)" }} />
        {children}
        <button type="button" onClick={(e) => { e.stopPropagation(); setZoom(true); }} aria-label={m.product.zoom}
          className="absolute right-4 bottom-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm hover:bg-white">
          <ZoomIn className="h-5 w-5" />
        </button>
        {n > 1 && (
          <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between lg:hidden">
            <button type="button" onClick={(e) => { e.stopPropagation(); go(-1); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/85" aria-label="←"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" onClick={(e) => { e.stopPropagation(); go(1); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/85" aria-label="→"><ChevronRight className="h-5 w-5" /></button>
          </div>
        )}
      </div>

      {zoom && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4" role="dialog" aria-modal="true" aria-label={m.product.gallery}>
          <button type="button" className="absolute top-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" onClick={() => setZoom(false)} aria-label={m.nav.close} autoFocus>
            <X className="h-6 w-6" />
          </button>
          {n > 1 && <button type="button" className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" onClick={() => go(-1)} aria-label="←"><ChevronLeft className="h-6 w-6" /></button>}
          <div className="relative aspect-square w-full max-w-[min(90vh,90vw)] overflow-hidden rounded-[2rem] bg-metal">
            <Image src={cur.url} alt={cur.alt} fill sizes="90vw" className="object-contain" />
          </div>
          {n > 1 && <button type="button" className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" onClick={() => go(1)} aria-label="→"><ChevronRight className="h-6 w-6" /></button>}
          <p className="absolute bottom-5 text-sm text-metal/70">{fmt(m.product.image, { n: i + 1, total: n })}</p>
        </div>
      )}
    </div>
  );
}
