// Bandeiras em SVG (emojis de bandeira não aparecem no Windows).
export function FlagBR({ className = "h-4 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 21" className={className} aria-hidden="true" role="img">
      <rect width="30" height="21" rx="2.5" fill="#009C3B" />
      <path d="M15 2.6 27 10.5 15 18.4 3 10.5Z" fill="#FFDF00" />
      <circle cx="15" cy="10.5" r="4.6" fill="#002776" />
      <path d="M10.6 9.6c3-.7 6.3-.3 8.9 1.3" stroke="#fff" strokeWidth="0.9" fill="none" />
    </svg>
  );
}

export function FlagCA({ className = "h-4 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 21" className={className} aria-hidden="true" role="img">
      <clipPath id="ca-r"><rect width="30" height="21" rx="2.5" /></clipPath>
      <g clipPath="url(#ca-r)">
        <rect width="30" height="21" fill="#fff" />
        <rect width="7.5" height="21" fill="#D52B1E" />
        <rect x="22.5" width="7.5" height="21" fill="#D52B1E" />
        <path
          fill="#D52B1E"
          d="M15 3.6l1.05 2.05 1.2-.6-.5 3.05 1.75-1.85.35 1.05 1.85-.35-.6 2.05.75.35-2.75 2.25.35 1.15-2.6-.45.1 3.1h-.6l.1-3.1-2.6.45.35-1.15-2.75-2.25.75-.35-.6-2.05 1.85.35.35-1.05 1.75 1.85-.5-3.05 1.2.6Z"
        />
      </g>
    </svg>
  );
}

export function Flag({ market, className }: { market: "BR" | "CA"; className?: string }) {
  return market === "BR" ? <FlagBR className={className} /> : <FlagCA className={className} />;
}
