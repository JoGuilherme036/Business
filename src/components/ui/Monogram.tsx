export function Monogram({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mono-brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgb(var(--brass-light))" />
          <stop offset="0.55" stopColor="rgb(var(--brass))" />
          <stop offset="1" stopColor="rgb(var(--brass-deep))" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22.5" fill="none" stroke="url(#mono-brass)" strokeWidth="1" />
      <circle cx="24" cy="24" r="19.5" fill="none" stroke="url(#mono-brass)" strokeWidth="0.5" opacity="0.6" />
      <text x="24" y="30.5" textAnchor="middle" fontFamily="'Bodoni Moda Variable', Didot, serif" fontSize="18" fontStyle="italic" fill="url(#mono-brass)" letterSpacing="-1">
        RB
      </text>
    </svg>
  );
}
