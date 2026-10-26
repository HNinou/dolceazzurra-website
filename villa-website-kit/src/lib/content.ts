// Page copy lives in src/content/pages/<locale>/<page>.md (frontmatter = structured copy, body = long prose).
import { liveCodes } from './i18n';

type Md = { frontmatter: Record<string, any>; Content: any };
const files = import.meta.glob<Md>('../content/pages/*/*.md', { eager: true });

export function page(locale: string, id: string): Md {
  const f = files[`../content/pages/${locale}/${id}.md`];
  if (!f) throw new Error(`Missing copy file src/content/pages/${locale}/${id}.md`);
  return f;
}

// Fail the build early if a live locale lacks a page file.
const ids = ['home', 'villa', 'gallery', 'alassio', 'services', 'book', 'legal', 'privacy'];
export function assertComplete() {
  for (const l of liveCodes) for (const id of ids) page(l, id);
}
