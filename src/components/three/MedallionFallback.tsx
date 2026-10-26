/** Static medallion for no-WebGL, data saver and loading states. Same composition as the 3D scene. */
export function MedallionFallback() {
  return (
    <svg viewBox="0 0 400 400" className="relative h-full w-full" role="img" aria-label="Medalha do Clube Business">
      <defs>
        <radialGradient id="mf-face" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#f3e6c8" />
          <stop offset="0.45" stopColor="#d6b88a" />
          <stop offset="1" stopColor="#6e5533" />
        </radialGradient>
        <linearGradient id="mf-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#8c7048" />
          <stop offset="1" stopColor="#e9d3a6" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="150" fill="url(#mf-rim)" />
      <circle cx="200" cy="200" r="138" fill="url(#mf-face)" />
      <circle cx="200" cy="200" r="118" fill="none" stroke="#3a2a12" strokeOpacity="0.5" strokeWidth="1.5" />
      <text x="200" y="232" textAnchor="middle" fontFamily="'Syne Variable', system-ui, sans-serif" fontWeight="800" fontSize="120" fill="#3a2a12" fillOpacity="0.75">
        B
      </text>
      <text x="200" y="290" textAnchor="middle" fontFamily="'Manrope Variable', sans-serif" fontSize="11" letterSpacing="6" fill="#3a2a12" fillOpacity="0.7">
        CLUBE · BUSINESS
      </text>
    </svg>
  );
}
