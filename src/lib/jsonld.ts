// VacationRental structured data (Google vacation-rental guidelines). No ratings or reviews.
import { getImage } from 'astro:assets';
import { photos } from './photos';
import { lp, tf } from './i18n';
import { cin, domain, house, legal, villa } from './villa';

export async function vacationRentalLd(locale: string, description: string) {
  const imgs = await Promise.all(
    photos.filter((p) => ['hero', 'feature', 'gallery'].includes(p.role)).slice(0, 12)
      .map(async (p) => domain + (await getImage({ src: p.src, width: Math.min(1280, p.src.width), format: 'webp' })).src),
  );
  const a = legal.address;
  const amenities = Object.values(house.amenities).flat() as string[];
  return {
    '@context': 'https://schema.org',
    '@type': 'VacationRental',
    additionalType: 'Villa',
    name: house.name,
    identifier: cin,
    url: domain + lp(locale),
    description,
    image: imgs,
    brand: { '@type': 'Brand', name: legal.company },
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${a.street}, ${a.locality}`,
      postalCode: a.postal_code,
      addressLocality: a.city,
      addressRegion: a.province,
      addressCountry: a.country,
    },
    latitude: legal.geo.lat,
    longitude: legal.geo.lng,
    checkinTime: house.check_in,
    checkoutTime: house.check_out,
    knowsLanguage: villa.contact.languages_spoken,
    containsPlace: {
      '@type': 'Accommodation',
      additionalType: 'EntirePlace',
      occupancy: { '@type': 'QuantitativeValue', value: house.capacity.guests },
      numberOfBedrooms: house.capacity.suites,
      numberOfBathroomsTotal: house.capacity.bathrooms,
      numberOfRooms: house.capacity.suites,
      floorSize: { '@type': 'QuantitativeValue', value: house.size_m2.villa, unitCode: 'MTK' },
      bed: { '@type': 'BedDetails', numberOfBeds: house.capacity.suites, typeOfBed: 'Queen' },
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: 'pool', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'ac', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'wifi', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'kitchen', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'washerDryer', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'freeParking', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'evCharger', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'heating', value: true },
        ...house.rules.some((r: string) => /smoking/i.test(r)) ? [{ '@type': 'LocationFeatureSpecification', name: 'smokingAllowed', value: false }] : [],
        ...house.rules.some((r: string) => /parties/i.test(r)) ? [{ '@type': 'LocationFeatureSpecification', name: 'partiesAllowed', value: false }] : [],
        ...amenities.map((x) => ({ '@type': 'LocationFeatureSpecification', name: tf(locale, x), value: true })),
      ],
    },
  };
}
