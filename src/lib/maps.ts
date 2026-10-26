import { fullAddress, site } from '@/config/site';

const { lat, lng } = site.address;
const q = encodeURIComponent(`${site.name}, ${fullAddress}`);

export const mapLinks = {
  google: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
  waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
  apple: `https://maps.apple.com/?daddr=${lat},${lng}&q=${q}`,
  embed: `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`,
};

/** Best default route link for the visitor's platform. */
export function routeLink() {
  if (typeof navigator !== 'undefined' && /iPhone|iPad|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document) {
    return mapLinks.apple;
  }
  return mapLinks.google;
}
