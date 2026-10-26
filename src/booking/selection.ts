import { serviceById } from '@/config/catalog';

export function toggleService(selected: string[], id: string) {
  if (selected.includes(id)) return selected.filter((x) => x !== id);
  const svc = serviceById(id);
  let next = [...selected, id];
  // Choosing a combo replaces the services it already includes, and vice versa.
  if (svc?.includes) next = next.filter((x) => !svc.includes!.includes(x));
  next = next.filter((x) => !serviceById(x)?.includes?.includes(id));
  return next;
}
