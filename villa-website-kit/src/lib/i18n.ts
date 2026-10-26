import en from '../i18n/en.json';
import fr from '../i18n/fr.json';
import it from '../i18n/it.json';
import { villa } from './villa';

const dicts: Record<string, any> = { en, fr, it };

export const defaultLocale: string = villa.site.default_locale;
export const liveLocales: { code: string; name: string }[] = villa.site.locales.filter((l: any) => l.status === 'live');
export const liveCodes = liveLocales.map((l) => l.code);

for (const c of liveCodes) if (!dicts[c]) throw new Error(`Locale "${c}" is live but src/i18n/${c}.json is not imported in lib/i18n.ts`);

export const ogLocale: Record<string, string> = { en: 'en_GB', fr: 'fr_FR', it: 'it_IT', de: 'de_DE', nl: 'nl_NL' };

/** getStaticPaths for src/pages/[...locale]/*: undefined = default locale at the root. */
export const localePaths = () =>
  liveCodes.map((code) => ({ params: { locale: code === defaultLocale ? undefined : code } }));

export const localeFromParam = (p?: string) => p ?? defaultLocale;

/** Localized path for a page slug ('' = home). Always with trailing slash. */
export function lp(locale: string, slug = ''): string {
  const prefix = locale === defaultLocale ? '' : `${locale}/`;
  const s = slug.replace(/^\/|\/$/g, '');
  return `/${prefix}${s ? s + '/' : ''}`;
}

function lookup(d: any, key: string) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), d);
}

/** UI string; falls back to English only for keys missing in a draft. Missing everywhere = build error. */
export function t(locale: string, key: string): any {
  const v = lookup(dicts[locale], key);
  if (v !== undefined) return v;
  throw new Error(`Missing i18n key "${key}" for locale "${locale}"`);
}

/**
 * Translate a free-text fact from villa.yaml (English source). EN returns the text itself;
 * other locales look it up in i18n/<code>.json -> yaml. A missing translation fails the build,
 * so an edit to villa.yaml can never silently ship English on the FR/IT pages.
 */
export function tf(locale: string, en: string): string {
  if (locale === 'en') return en;
  const v = dicts[locale]?.yaml?.[en];
  if (!v) throw new Error(`Missing ${locale} translation for villa.yaml text: "${en}" (add it to src/i18n/${locale}.json "yaml")`);
  return v;
}
