import Image from "next/image";
import { STORES, type StoreKey } from "@/lib/stores";

/** Moldura das telas de autenticação: painel escuro com o emblema + formulário claro. */
export function AuthShell({ store, title, subtitle, children, footer }: { store: StoreKey; title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="on-light container-x grid gap-10 py-12 lg:grid-cols-2 lg:items-stretch lg:py-16">
      <div className="layer-lines relative hidden overflow-hidden rounded-[2.25rem] bg-ink lg:flex lg:items-center lg:justify-center">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 700" aria-hidden>
          <ellipse cx="300" cy="360" rx="280" ry="90" transform="rotate(-14 300 360)" fill="none" stroke="#00DCE8" strokeOpacity="0.55" strokeWidth="1.4" />
        </svg>
        <Image src={STORES[store].logo} alt="Fantaisie 3D" width={340} height={340} className="relative h-auto w-[58%]" priority />
      </div>
      <div className="mx-auto flex w-full max-w-md flex-col justify-center">
        <h1 className="text-3xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-2 text-mute">{subtitle}</p>}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-6 text-sm text-mute">{footer}</div>}
      </div>
    </div>
  );
}
