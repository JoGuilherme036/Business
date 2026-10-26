export const navLinks: readonly { id: string; label: string; numeral: string; to?: string }[] = [
  { id: 'servicos', label: 'Serviços', numeral: 'I' },
  { id: 'experiencia', label: 'Experiência', numeral: 'II' },
  { id: 'produtos', label: 'Produtos', numeral: 'III', to: '/produtos' },
  { id: 'equipe', label: 'Barbeiros', numeral: 'IV' },
  { id: 'local', label: 'Localização', numeral: 'V' },
];

/** Scrolls to a home section, respecting reduced motion. */
export function scrollToSection(id: string, reduced: boolean) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', `#${id}`);
  return true;
}
