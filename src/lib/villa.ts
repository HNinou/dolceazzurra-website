// Loads content/villa.yaml at build time. Every fact on the site comes from here.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const file = path.join(process.cwd(), 'content', 'villa.yaml');
export const villa: any = YAML.parse(fs.readFileSync(file, 'utf8'));

export const TODO = 'TODO_OWNER';
/** True when the owner has supplied the value. */
export const known = (v: unknown) => v !== undefined && v !== null && v !== TODO;

export const domain: string = villa.site.domain.replace(/\/$/, '');
export const cin: string = villa.legal.cin;
export const house = villa.house;
export const legal = villa.legal;
export const contact = villa.contact;
export const booking = villa.booking;
export const rates = villa.rates;
export const location = villa.location;
export const services: any[] = villa.services;

export const mapsUrl: string = legal.maps_url ?? `https://www.google.com/maps/search/?api=1&query=${legal.geo.lat},${legal.geo.lng}`;
export const instagramUrl = `https://www.instagram.com/${contact.instagram}/`;
export const telHref = (n: string) => 'tel:' + n.replace(/[^\d+]/g, '');

/** WhatsApp link to the first number marked whatsapp: true, with a greeting in the page language. */
const waMessage: Record<string, string> = {
  en: 'Hello, I have a question about Villa Dolce & Azzurra.',
  fr: "Bonjour, j'ai une question sur la Villa Dolce & Azzurra.",
  it: 'Buongiorno, ho una domanda sulla Villa Dolce & Azzurra.',
  de: 'Guten Tag, ich habe eine Frage zur Villa Dolce & Azzurra.',
};
export const whatsappNumber: string | undefined = contact.phones.find((p: any) => p.whatsapp === true)?.number;
export const whatsappUrl = (locale: string) =>
  whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(waMessage[locale] ?? waMessage.en)}` : undefined;

/** Values available to copy as {token}. Copy never retypes a number. */
export const tokens: Record<string, string | number> = {
  guests: house.capacity.guests,
  suites: house.capacity.suites,
  bathrooms: house.capacity.bathrooms,
  priceLow: rates.low_season_per_night,
  priceHigh: rates.high_season_per_night,
  perPerson: Math.round(rates.low_season_per_night / house.capacity.guests),
  altitude: house.altitude_m,
  villaSize: house.size_m2.villa,
  patio: house.size_m2.patio,
  garden: house.size_m2.garden.toLocaleString('en').replace(',', '\u00A0'),
  completed: house.construction.completed,
  checkIn: house.check_in,
  checkOut: house.check_out,
  beachKm: location.distances[0].km,
  beachTime: location.distances[0].time,
  architect: house.architect.name,
  award: house.award.name,
  awardCategory: house.award.category,
  cin,
  genoaTime: location.distances.find((d: any) => /GOA/.test(d.place))?.time,
  niceTime: location.distances.find((d: any) => /NCE/.test(d.place))?.time,
};

/** Replace {token} in copy with values from villa.yaml. Unknown tokens fail the build. */
export function fill(text: string, extra: Record<string, string | number> = {}): string {
  return String(text).replace(/\{(\w+)\}/g, (_, k) => {
    const v = k in extra ? extra[k] : tokens[k];
    if (v === undefined || v === TODO) throw new Error(`Unknown or missing copy token {${k}}`);
    return String(v);
  }).replace(/(\d) (m²|m\b|km|€|kg|cm)/g, '$1\u00A0$2');
}

/** Minimum stays the owner has confirmed (status other than "proposed"). */
export const confirmedMinStays = Object.entries(rates.minimum_stay || {})
  .filter(([, v]: any) => v && v.status !== 'proposed' && known(v.nights))
  .map(([k, v]: any) => ({ id: k, ...v }));
