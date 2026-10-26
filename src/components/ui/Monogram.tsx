export function Monogram({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mono-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgb(var(--accent-light))" />
          <stop offset="0.55" stopColor="rgb(var(--accent))" />
          <stop offset="1" stopColor="rgb(var(--accent-deep))" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="45" height="45" fill="none" stroke="url(#mono-accent)" strokeWidth="1" />
      <rect x="5" y="5" width="38" height="38" fill="none" stroke="url(#mono-accent)" strokeWidth="0.5" opacity="0.6" />
      <text x="24" y="31.5" textAnchor="middle" fontFamily="'Archivo Variable', 'Arial Black', sans-serif" fontWeight="900" fontSize="21" fill="url(#mono-accent)" letterSpacing="0">
        B
      </text>
    </svg>
  );
}
