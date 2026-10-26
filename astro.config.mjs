import fs from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import YAML from 'yaml';

// Locales come from content/villa.yaml: flipping a locale to `live` there is all it takes.
const villa = YAML.parse(fs.readFileSync(new URL('./content/villa.yaml', import.meta.url), 'utf8'));
const live = villa.site.locales.filter((l) => l.status === 'live').map((l) => l.code);
const def = villa.site.default_locale;

export default defineConfig({
  site: villa.site.domain.replace(/\/$/, ''),
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: { defaultLocale: def, locales: live, routing: { prefixDefaultLocale: false } },
  integrations: [
    sitemap({
      i18n: { defaultLocale: def, locales: Object.fromEntries(live.map((c) => [c, c])) },
      filter: (page) => !/\/404\/?$/.test(page),
    }),
  ],
});
