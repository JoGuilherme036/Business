import { site } from '../config/site';

const dayCodes = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** schema.org BarberShop data. Reviews are only included when real ones are configured. */
export function buildJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BarberShop',
    name: site.name,
    url: site.url,
    image: `${site.url}/media/og-image.jpg`,
    telephone: site.contact.phoneHref,
    email: site.contact.email,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.zip,
      addressCountry: 'BR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.address.lat, longitude: site.address.lng },
    openingHoursSpecification: Object.entries(site.hours).flatMap(([d, ranges]) =>
      ranges.map((r) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: dayCodes[Number(d)], opens: r.start, closes: r.end })),
    ),
    sameAs: [site.contact.instagram],
  };
}
