/** BUSINESS / BARBEARIA wordmark, set in expanded Archivo like the shop's sign. */
export function Logo({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = {
    sm: { word: 'text-[15px]', sub: 'text-[6.5px] tracking-[0.62em] mt-[3px]' },
    md: { word: 'text-[19px]', sub: 'text-[7.5px] tracking-[0.66em] mt-1' },
    lg: { word: 'text-[30px]', sub: 'text-[10.5px] tracking-[0.7em] mt-1.5' },
  }[size];
  return (
    <span className={`inline-flex flex-col items-center leading-none text-ivory ${className}`}>
      <span className={`font-display font-black uppercase tracking-[0.01em] ${s.word}`} style={{ fontStretch: '125%' }}>
        Business
      </span>
      <span className={`pl-[0.66em] font-sans font-semibold uppercase ${s.sub}`}>Barbearia</span>
    </span>
  );
}
