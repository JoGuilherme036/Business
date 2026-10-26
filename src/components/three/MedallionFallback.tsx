/** Static medallion for no-WebGL, data saver and loading states. Same composition as the 3D scene. */
export function MedallionFallback() {
  return (
    <svg viewBox="0 0 400 400" className="relative h-full w-full" role="img" aria-label="Medalha do Clube Velha Guarda">
      <defs>
        <radialGradient id="mf-face" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#e6ecf7" />
          <stop offset="0.45" stopColor="#a9b6cc" />
          <stop offset="1" stopColor="#3b4b66" />
        </radialGradient>
        <linearGradient id="mf-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#5a6f95" />
          <stop offset="1" stopColor="#c5d0e3" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="150" fill="url(#mf-rim)" />
      <circle cx="200" cy="200" r="138" fill="url(#mf-face)" />
      <circle cx="200" cy="200" r="118" fill="none" stroke="#7a1d22" strokeOpacity="0.5" strokeWidth="1.5" />
      <text x="200" y="232" textAnchor="middle" fontFamily="'Fraunces Variable', Georgia, serif" fontStyle="italic" fontSize="104" fill="#7a1d22" fillOpacity="0.75">
        VG
      </text>
      <text x="200" y="290" textAnchor="middle" fontFamily="'Manrope Variable', sans-serif" fontSize="11" letterSpacing="6" fill="#7a1d22" fillOpacity="0.7">
        CLUBE · ATELIÊ
      </text>
    </svg>
  );
}
