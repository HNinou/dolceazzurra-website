// Maps content/photos.yaml to imported image assets. Only rights: owner|licensed photos exist in src/.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import type { ImageMetadata } from 'astro';
import { t } from './i18n';

const modules = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.webp', { eager: true });
const byFile = new Map(Object.entries(modules).map(([k, m]) => [path.basename(k), m.default]));

const catalogue: any[] = YAML.parse(fs.readFileSync(path.join(process.cwd(), 'content', 'photos.yaml'), 'utf8')).photos;

export type Photo = { id: string; file: string; src: ImageMetadata; group: string; role: string; altEn: string; credit?: string; small?: boolean };

export const photos: Photo[] = catalogue
  .filter((p) => (p.rights === 'owner' || p.rights === 'licensed') && byFile.has(p.file))
  .map((p) => ({ id: p.file.slice(0, 2), file: p.file, src: byFile.get(p.file)!, group: p.group, role: p.role, altEn: p.alt_en, credit: p.credit, small: p.display === 'small' }));

/** Photo by its two-digit number, e.g. photo('04'). */
export function photo(id: string): Photo {
  const p = photos.find((x) => x.id === id);
  if (!p) throw new Error(`Photo ${id} not available (missing or rights not confirmed)`);
  return p;
}

/** Alt text in the page language (EN from photos.yaml, others from i18n/<code>.json -> alt). */
export function alt(locale: string, p: Photo): string {
  return locale === 'en' ? p.altEn : t(locale, `alt.${p.id}`);
}

export const groups = ['architecture', 'outdoors', 'pool', 'interiors', 'suites'];
