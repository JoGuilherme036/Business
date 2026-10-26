export const navLinks = [
  { id: 'servicos', label: 'Serviços', numeral: 'I' },
  { id: 'ritual', label: 'O ritual', numeral: 'II' },
  { id: 'equipe', label: 'Barbeiros', numeral: 'III' },
  { id: 'estilos', label: 'Estilos', numeral: 'IV' },
  { id: 'local', label: 'Localização', numeral: 'V' },
] as const;

/** Scrolls to a home section, respecting reduced motion. */
export function scrollToSection(id: string, reduced: boolean) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', `#${id}`);
  return true;
}
