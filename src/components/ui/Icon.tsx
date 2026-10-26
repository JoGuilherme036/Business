// Thin-stroke icon set drawn for the brand (1.5px on a 24 grid).
const paths = {
  whatsapp: (
    <>
      <path d="M4.5 19.5l1.1-3.6A8 8 0 1 1 8.4 18.6z" />
      <path d="M9.2 8.6c.2-.5.5-.6.8-.6h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .5-.1.7l-.5.6c.6 1.1 1.5 2 2.7 2.6l.6-.6c.2-.2.4-.2.7-.1l1.5.7c.3.1.4.3.4.5v.5c0 .4-.2.7-.6.9-.6.3-1.4.4-2.3.1-2.4-.8-4.3-2.7-5.1-5.1-.3-.8-.2-1.6.3-2.1z" />
    </>
  ),
  phone: <path d="M6.6 3.8l2.3-.3 1.4 3.9-1.8 1.3a11 11 0 0 0 6.8 6.8l1.3-1.8 3.9 1.4-.3 2.3a2 2 0 0 1-2.1 1.7C11.3 18.8 5.2 12.7 4.9 5.9a2 2 0 0 1 1.7-2.1z" />,
  route: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  arrowRight: <path d="M4 12h15M13.5 6.5L19 12l-5.5 5.5" />,
  arrowLeft: <path d="M20 12H5M10.5 6.5L5 12l5.5 5.5" />,
  arrowUpRight: <path d="M7 17L17 7M9 7h8v8" />,
  arrowDown: <path d="M12 4v15M6.5 13.5L12 19l5.5-5.5" />,
  menu: <path d="M4 8h16M4 16h10" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
      <path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
    </>
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.8" cy="7.2" r=".6" fill="currentColor" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5" />
    </>
  ),
  cube: (
    <>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
    </>
  ),
  reset: (
    <>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M4.5 4.5v4h4" />
    </>
  ),
  play: <path d="M8 5.5v13l10-6.5z" />,
  pause: <path d="M8.5 5.5v13M15.5 5.5v13" />,
  share: (
    <>
      <path d="M12 3.5v11M7.5 8L12 3.5 16.5 8" />
      <path d="M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="6.5" cy="17.5" r="2.5" />
      <path d="M8.5 8l11 9M8.5 16l11-9" />
    </>
  ),
  sparkle: <path d="M12 3.5l1.8 6.7 6.7 1.8-6.7 1.8-1.8 6.7-1.8-6.7L3.5 12l6.7-1.8z" />,
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = 'h-5 w-5', strokeWidth = 1.5 }: { name: IconName; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}
