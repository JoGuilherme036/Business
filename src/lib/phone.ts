/** Normalizes Brazilian phone input (pasted with +55, spaces, dashes…) to 10–11 national digits. */
export function normalizeBrPhone(input: string) {
  let d = input.replace(/\D/g, '');
  if (d.startsWith('55') && d.length >= 12) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  return d;
}

export const isValidBrPhone = (input: string) => {
  const d = normalizeBrPhone(input);
  return /^[1-9]{2}9\d{8}$/.test(d) || /^[1-9]{2}[2-5]\d{7}$/.test(d);
};

export function maskBrPhone(input: string) {
  const d = normalizeBrPhone(input).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
