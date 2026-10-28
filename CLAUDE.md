# CLAUDE.md: Villa Dolce & Azzurra website

You are building the direct-booking website for **Villa Dolce & Azzurra**, an architect-designed holiday villa above Alassio (Liguria, Italy).
It is a static site, hosted on **GitHub Pages** at **https://www.dolceazzurra.com**. Bookings are handled by the owner's **Hostaway** account.

This file is the spec. Read it fully before writing code. When the spec and your instinct disagree, the spec wins. When the spec is silent, choose the simplest option that keeps every check green and note the decision in `docs/BUILD-REPORT.md`.

---

## 0. Definition of done

The site is done when **all** of these are true:

1. `npm run build` succeeds with no warnings you introduced.
2. `npm run verify -- --strict` prints `RESULT: PASS`. This is the static checker: SEO, i18n, CIN, banned claims, links, images, photo rights, booking widget.
3. `npm run check:visual` prints `RESULT: PASS`. This is the browser checker: overflow, broken images, console errors, sticky booking button, accessibility, screenshots.
4. You have **looked at every screenshot** in `.verify/screenshots/` and they meet section 5 (Design). Fix anything that looks off, even if the checks pass.
5. `docs/BUILD-REPORT.md` is up to date: what was built, decisions taken, and the output of `npm run todo` (facts the owner must still supply).
6. Everything is committed and pushed to `main`; the GitHub Actions deploy is green.

Never claim a step is done without running its check and reading the output.

---

## 1. Read these first (in this order)

| File | What it is |
| --- | --- |
| `content/villa.yaml` | **Single source of truth for every fact**: capacity, rates, CIN, contacts, amenities, distances, booking IDs, locales. |
| `content/copy-brief.md` | Voice, key messages, **banned claims**, page outlines with draft English headlines. |
| `content/photos.yaml` | Photo catalogue: file, size, rights, role, English alt text. |
| `reference/architect-notes.md` | Paraphrased architecture story (the architect's text is copyrighted; paraphrase, quote max one short credited sentence). |
| `reference/old-site.html` | The previous one-page site. **Mine it for content only.** Do not copy its structure, hidden SEO blocks, keyword lists, claims or styling. |
| `docs/PROPOSAL.md` | The strategy behind the site (positioning, audience, design direction). |
| `docs/LAUNCH-CHECKLIST.md` | Things only the owner can do (DNS, Hostaway, proofreading). |

---

## 2. Non-negotiable rules

1. **Facts come from `content/villa.yaml`.** Never invent a fact, number, review, award, price, policy or distance. A value of `TODO_OWNER` means unknown: omit that element (render nothing), and list it in the build report.
2. **Banned claims** (see `content/copy-brief.md`): no "Passivhaus certified", no photovoltaics, no energy figures, no star ratings, no "award-winning" (it is a *longlist*), no salt-water pool, no hype words, no Mantellassi or other agency. The verifier enforces this in every language.
3. **One booking path: Hostaway.** Every page has a visible "Check dates" button (`data-cta="book"`) leading to the Book page with the Hostaway calendar widget.
4. **The CIN `IT009001B4PNT36KBS` is visible on every page** (footer). Italian law.
5. **Photo rights:** only photos with `rights: owner` (or `licensed`) in `content/photos.yaml` may be copied into `src/`. The 18 Alassio photos are `unconfirmed`: do not use them. Use villa photos for the Alassio page until the owner confirms.
6. **No third-party requests** except the Hostaway widget (`d2q3n06xhbi0am.cloudfront.net`, `book.dolceazzurra.com`, i.e. the host of `villa.yaml` → `booking.base_url`). No Google Fonts, no Google Maps embeds, no analytics, no cookie banners, no tracking pixels. Fonts are self-hosted. Map = a plain "Open in Google Maps" link.
7. **No hidden text, no keyword lists, no `meta keywords`.** The old site had these. They are SEO spam.
8. **Draft locales (`de`, `nl`) are not built** until `villa.yaml` marks them `live`. Do not link them anywhere.
9. **The repo is public.** Never commit secrets, API keys, guest data, or anything the owner hasn't already published.
10. **Don't touch** `content/`, `reference/` or `scripts/` except to fix a genuine bug in a script (explain it in the build report). Never weaken a check to make it pass.

---

## 3. Stack and setup

- **Astro** (static output), plain CSS with custom properties (no Tailwind, no UI framework), minimal vanilla JS.
- Node 22.23+ (Astro 7 needs it; CI uses Node 24).
- Images through `astro:assets` (`<Picture>`/`<Image>`) → AVIF + WebP, responsive `srcset`, explicit `width`/`height`.
- Fonts via Fontsource (self-hosted): `@fontsource-variable/fraunces` (headings) and `@fontsource-variable/inter` (text).
- Sitemap via `@astrojs/sitemap` with i18n.
- Verifiers need `playwright`, `@axe-core/playwright` and `yaml`.

### Setup commands (phase 0)

```bash
npm install astro @astrojs/sitemap sharp yaml @fontsource-variable/fraunces @fontsource-variable/inter
npm install -D playwright @axe-core/playwright
npx playwright install chromium
mkdir -p src/assets/photos src/assets/brand public
# copy ONLY rights: owner photos (01, 03-23) into src/assets/photos/
node -e "const Y=require('yaml'),fs=require('fs');for(const p of Y.parse(fs.readFileSync('content/photos.yaml','utf8')).photos)if(p.rights==='owner')fs.copyFileSync('assets/photos/'+p.file,'src/assets/photos/'+p.file)"
cp assets/brand/logo-sunset-sand.webp src/assets/brand/
```

`package.json` already contains the scripts below. Keep them:

```json
"dev": "astro dev",
"build": "astro build",
"preview": "astro preview",
"verify": "node scripts/verify.mjs",
"check:visual": "node scripts/visual-check.mjs",
"todo": "node scripts/owner-todo.mjs",
"check": "npm run build && npm run verify && npm run check:visual"
```

### `astro.config.mjs` (required settings)

- `site: 'https://www.dolceazzurra.com'`
- `trailingSlash: 'always'`, `build: { format: 'directory' }`
- `i18n: { defaultLocale: 'en', locales: <live codes read from content/villa.yaml>, routing: { prefixDefaultLocale: false } }`
- `integrations: [sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', fr: 'fr', it: 'it' } } })]`. Build the `locales` map from `villa.yaml` too, so flipping `de` to `live` is a one-line change.
- `public/CNAME` containing exactly `www.dolceazzurra.com`.
- `public/robots.txt`: allow all + `Sitemap: https://www.dolceazzurra.com/sitemap-index.xml`.

---

## 4. Architecture

### URLs (English slugs in every language)

| Page | EN | FR | IT |
| --- | --- | --- | --- |
| Home | `/` | `/fr/` | `/it/` |
| The Villa | `/villa/` | `/fr/villa/` | `/it/villa/` |
| Gallery | `/gallery/` | `/fr/gallery/` | `/it/gallery/` |
| Alassio | `/alassio/` | `/fr/alassio/` | `/it/alassio/` |
| Services | `/services/` | `/fr/services/` | `/it/services/` |
| Book | `/book/` | `/fr/book/` | `/it/book/` |
| Legal notice | `/legal/` | `/fr/legal/` | `/it/legal/` |
| Privacy | `/privacy/` | `/fr/privacy/` | `/it/privacy/` |
| 404 | `/404.html` | | |

These are exactly the pages `scripts/lib/site.mjs` → `REQUIRED_PAGES` checks. A Journal (blog) can come later; it is not part of v1.

### Folders

```
src/
  pages/[...locale]/index.astro, villa.astro, gallery.astro, alassio.astro,
         services.astro, book.astro, legal.astro, privacy.astro   # getStaticPaths: locale = undefined (en) + other live codes
  pages/404.astro
  layouts/Base.astro          # <html lang>, head (title, description, canonical, hreflang, OG), header, footer, sticky CTA
  components/                 # Header, Footer, LanguageSwitcher, StickyCta, Hero, FactsStrip, Section, Figure,
                              # Gallery, Lightbox, BookingWidget, Faq, DistanceTable, ServiceCard, AwardLine, Logo
  content/pages/<locale>/<page>.md   # long-form copy; frontmatter: title, description, reviewed: false
  i18n/<locale>.json          # UI strings; first key "_reviewed": false
  lib/villa.ts                # loads content/villa.yaml at build time (fs + yaml) and exports typed data
  lib/i18n.ts                 # t(locale, key), localized path helper, live locales
  lib/photos.ts               # maps photos.yaml entries to imported image assets (import.meta.glob)
  styles/tokens.css, global.css
public/ CNAME, robots.txt, favicon.svg, og/ (1200x630 JPEGs per locale, generated from the hero photo)
```

### Head, required on every page (the verifier checks these)

- `<html lang="en|fr|it">`, one `<h1>`.
- `<title>` 10-70 chars: `<Page> · Villa Dolce & Azzurra, Alassio`. `<meta name="description">` 50-170 chars, unique per page and language.
- `<link rel="canonical">` = absolute URL of the page itself, with trailing slash.
- `<link rel="alternate" hreflang="…">` for every **live** locale + `x-default` (pointing to the EN URL).
- `og:title`, `og:description`, `og:image` (absolute URL, 1200×630), `og:locale`, `twitter:card=summary_large_image`.

### Legacy URLs

The old site used `/?lang=fr`. The root page (`/`) must include a tiny inline script: if `?lang=` is a **live** locale other than `en`, `location.replace('/<code>/')`. Otherwise stay.

### Translation workflow

- Write English first in `src/content/pages/en/*.md` and `src/i18n/en.json`.
- Then FR and IT. Natural, idiomatic text, not literal translation; same facts.
- Every new or changed translated file gets `reviewed: false` (or `"_reviewed": false`). **Only the owner flips it to `true`** after proofreading. `npm run verify` warns on unreviewed files; `--strict` (used by CI before deploy) fails on them. This is intentional: nothing reaches guests unreviewed.
- English files also start `reviewed: false`; the owner proofreads EN, FR and IT.
- DE and NL: write drafts only when asked. They stay `status: draft` until a native speaker has reviewed them.

---

## 5. Design

**Concept:** the site feels like the house: stone, oak, light and space. Think architecture monograph, not holiday template. The photographs do the talking; type is calm; there is a lot of air.

### Tokens (`src/styles/tokens.css`)

```css
:root {
  --c-bg: #F4EFE8;        /* warm plaster: page background (never pure white) */
  --c-surface: #EAE3D9;   /* slightly deeper plaster: cards, bands */
  --c-ink: #23251F;       /* deep olive-black: text */
  --c-ink-soft: #55574F;  /* secondary text (check AA contrast on --c-bg) */
  --c-bay: #2F5D7C;       /* bay blue: links, primary button */
  --c-oak: #C9A67C;       /* oak / logo sand: thin rules, small accents only */
  --c-olive: #7D8461;     /* olive leaf: tags, icons */
  --c-dusk: #D9B7AE;      /* dusk rose: rare highlight (booking band) */
  --font-display: "Fraunces Variable", Georgia, serif;
  --font-text: "Inter Variable", system-ui, sans-serif;
  --step--1: clamp(0.83rem, 0.8rem + 0.15vw, 0.9rem);
  --step-0:  clamp(1rem, 0.96rem + 0.2vw, 1.125rem);
  --step-1:  clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);
  --step-2:  clamp(1.6rem, 1.4rem + 1vw, 2.2rem);
  --step-3:  clamp(2.1rem, 1.7rem + 2vw, 3.4rem);
  --step-4:  clamp(2.6rem, 2rem + 3vw, 4.6rem);
  --space-1: 0.5rem; --space-2: 1rem; --space-3: 1.5rem; --space-4: 2.5rem; --space-5: 4rem; --space-6: 6.5rem;
  --measure: 38rem;   --wide: 76rem;   --radius: 4px;   --ease: cubic-bezier(.2,.6,.2,1);
}
```

Use **one accent per screen**. The old site's dark navy (`#0a1628`) is retired. Dark mode is not required.

### Typography

- Headings: Fraunces, weight 350-450, slight negative letter-spacing at large sizes, sentence case.
- Text: Inter 400, line-height 1.6, max width `--measure`.
- Small caps-style labels (Inter 500, `--step--1`, letter-spacing .08em, uppercase) for section kickers like "THE VILLA", "BOOK".

### Layout and imagery

- Mobile first. Side padding 1rem (mobile) → 2.5rem (desktop). Content max `--wide`.
- **Full-bleed photos** at section starts; text sections in a single calm column; occasional two-column image + text on desktop.
- Images never distorted; `object-fit: cover` with sensible `object-position` (keep the horizon/sea visible).
- **Hero (home):** `01-…terrasse-avec-vue-mer` full-bleed, 85-100svh, a soft dark gradient only at the bottom for legible white text. H1 + sub + one button. No carousel, no autoplay video.
- Vertical photo `04-…coucher-de-soleil` anchors the booking band (image left, widget/CTA right on desktop; stacked on mobile).
- Gallery: masonry-like CSS grid grouped by `group` (Architecture, Outdoors, Pool, Interiors, Suites); click opens a light, keyboard-accessible lightbox (Esc, arrows, swipe). Use `<dialog>`.

### Components

- **Header:** logo (rebuild the sunset mark as a simple inline SVG in `--c-oak`, wordmark "DOLCE & AZZURRA" in spaced caps), nav (Villa, Gallery, Alassio, Services), language switcher (live locales; links to the same page in the other language), "Check dates" button. Transparent over the hero, solid `--c-bg` after scroll. On mobile, a full-screen menu.
- **Sticky CTA:** on mobile a bottom bar "Check dates · from €700/night" (`data-cta="book"`), on desktop the header button stays visible (sticky header). Must be visible mid-page (the browser check tests it). Hide it on the Book page itself.
- **Facts strip:** 8 guests · 4 suites · 5 bathrooms · infinity pool · 180° sea view. Thin oak rules between items.
- **Award line:** "Longlisted · Archello Awards 2026 · Small House of the Year (Rural)" + architect credit with link.
- **Footer:** contact (email, phones, Instagram), address, `CIN IT009001B4PNT36KBS`, company + VAT, links to Legal and Privacy, architect credit, © year.
- **FAQ:** `<details>/<summary>`, no JS.

### Motion

Subtle only: fade/translate 12px on scroll-in (IntersectionObserver, CSS transitions), header background transition. Respect `prefers-reduced-motion` (no motion). No parallax, no scroll-jacking.

### Accessibility

WCAG 2.2 AA: contrast, visible focus rings (2px `--c-bay`), skip link, landmarks (`header`, `nav`, `main`, `footer`), alt text from `photos.yaml` (translated), labelled buttons, tap targets ≥ 44px, `lang` on language-switcher links (`hreflang` + `lang`).

---

## 6. Pages

Content outlines and draft English headlines are in `content/copy-brief.md`. Structural requirements:

- **Home:** Hero → facts strip → intro (2-3 sentences) + architect quote + award line → three "moments" (morning patio / afternoon pool / evening pergola), each a photo + 2 sentences → 6-photo strip linking to Gallery → booking band (photo 04 + `BookingWidget` + "from" price + included list summary) → short Alassio teaser → footer. `VacationRental` JSON-LD.
- **The Villa:** architecture story (paraphrased from `reference/architect-notes.md`, credited) with photos 08, 11, 07 → suites → living spaces → outdoors → sustainability (features list only) → amenities (grouped lists from `villa.yaml`) → CTA.
- **Gallery:** all `rights: owner` photos with `role` gallery/feature/hero, grouped by `group`.
- **Alassio:** text sections from `villa.yaml` → `location`: beaches & Budello, Muretto, Gallinara, walks from the villa, cycle path, day trips, restaurants (only `verified` ones; if none verified, show the section without restaurant names and list them in the build report), distances table, "Open in Google Maps" link (`https://www.google.com/maps/search/?api=1&query=44.0086,8.1731`). Villa photos only (Alassio photos are unconfirmed).
- **Services:** one card per `villa.yaml` → `services`, each ending with an "Ask us" mailto link (prefilled subject). Note: "Paid separately, arranged on request."
- **Book:** `BookingWidget` (one per page), "From €700 a night for up to 8 guests, plus a €440 final cleaning fee per stay", minimum-stay rules (only non-`proposed` values; if all proposed, say "Minimum stay varies by season, see the calendar"), included list, check-in 16:00 / check-out 10:00, house rules, FAQ, deposit/cancellation **only if not TODO_OWNER**, CIN.
- **Legal:** company, VAT, address, CIN, contact, architect credit, photo credits.
- **Privacy:** GDPR notice: no cookies or analytics on this site; booking is processed by Hostaway (link their privacy policy) when the guest uses the widget; contact for data requests. Keep it short and factual. Mark `reviewed: false`; the owner must check it.

---

## 7. Booking: the Hostaway calendar widget

`src/components/BookingWidget.astro`, used on Book and in the Home booking band. Hostaway allows **one widget per page**. Load the script only when the widget scrolls near the viewport (IntersectionObserver) to protect performance. Show a fallback link to `villa.yaml → booking.listing_url` (localized: `/en/`, `/fr/`, `/it/` in the path) inside `<noscript>` and while loading.

```html
<div id="hostaway-calendar-widget"></div>
<script src="https://d2q3n06xhbi0am.cloudfront.net/calendar.js"></script>
<script>
  window.hostawayCalendarWidget({
    baseUrl: 'https://book.dolceazzurra.com/',        // villa.yaml booking.base_url
    listingId: 572451,                                   // villa.yaml booking.listing_id
    numberOfMonths: 2,                                   // 1 on screens < 700px
    openInNewTab: false,
    font: 'Open Sans',                                   // must be a Hostaway-supported font name
    rounded: false,
    button: { action: 'checkout', text: 'Check availability' },   // localize the text
    clearButtonText: 'Clear dates',                                // localize
    color: { mainColor: '#2F5D7C', frameColor: '#E6DED3', textColor: '#23251F' },
  });
</script>
```

Values must come from `villa.yaml` (inject at build time), not be hard-coded twice. The widget will not render offline or in the local browser check (that is a warning, not a failure); it must render on the live site (owner checks it, see `docs/LAUNCH-CHECKLIST.md`).

---

## 8. SEO and structured data

- Unique title and description per page and language, written for humans. Primary phrases per language: EN "villa with pool Alassio", FR "villa avec piscine Alassio", IT "villa con piscina Alassio", used naturally, never stuffed.
- `VacationRental` JSON-LD on the home page (each language) following Google's vacation-rental structured data: `name`, `identifier` (CIN), `url`, `image` (≥ 8 absolute URLs of villa photos), `address`, `latitude`, `longitude`, `containsPlace` (`Accommodation` with `occupancy` max 8, `numberOfBedrooms` 4, `numberOfBathroomsTotal` 5, `bed`, `amenityFeature` list). **No `aggregateRating` or `review`** (the verifier fails on them).
- Sitemap with i18n alternates; robots.txt; canonical + hreflang as in section 4.
- Image `alt` in the page's language. Descriptive filenames are already in place.

---

## 9. Performance budgets

- HTML ≤ 200 KB per page; total JS ≤ 200 KB (the widget script excluded); no image file > 450 KB.
- Hero image: `loading="eager"`, `fetchpriority="high"`, `sizes="100vw"`, widths 640/960/1280/1600. Everything else `loading="lazy"`.
- Preload only the two font files actually used above the fold.
- Target Lighthouse mobile ≥ 90 for Performance, Accessibility, Best Practices, SEO. If you can run Lighthouse (`npx lighthouse <url> --preset=desktop|--form-factor=mobile`), do it on `/` and `/book/` and record the scores in the build report.

---

## 10. Working method (phases and gates)

Work in phases. **At the end of each phase run the gate, fix until green, update `docs/BUILD-REPORT.md`, commit.** Keep commits small and messages clear (`feat: villa page`, `fix: hreflang on legal`).

| Phase | Build | Gate |
| --- | --- | --- |
| 0. Setup | Install, config, folders, tokens, Base layout, empty versions of all required pages in EN/FR/IT with correct head, footer (CIN) and sticky CTA | `npm run build && npm run verify` (copy may be minimal but must have no placeholders) |
| 1. Design system | Header, footer, sticky CTA, hero, facts strip, section/figure, gallery + lightbox, booking widget, FAQ | `npm run check` + **review screenshots** |
| 2. English content | All EN pages, complete, from `villa.yaml` + copy brief | `npm run check` + screenshots |
| 3. FR + IT | Translations (`reviewed: false`) and translated alt text | `npm run check` + screenshots of `fr-*` and `it-*` |
| 4. SEO polish | JSON-LD, OG images, legacy redirect, 404, sitemap check | `npm run check` |
| 5. Deploy | `.github/workflows/deploy.yml` is provided; push to `main`; confirm the Action is green | Action green; owner does DNS (checklist) |

Screenshots: after `npm run check:visual`, open the PNGs in `.verify/screenshots/` (Read tool) and judge them like a demanding art director: hierarchy, spacing, alignment, image crops (sea and horizon visible), text legibility over images, mobile tap targets, nothing cramped or orphaned. Fix and re-run.

When you are blocked on a missing fact, **do not stop**: omit the element, add it to the build report, continue.

Ask the owner (in chat) only when a decision changes what guests see and is not covered here.

---

## 11. Verification reference

| Command | Checks |
| --- | --- |
| `npm run verify` | Required pages for each live locale; draft locales absent; `lang`, title, description, viewport, no meta keywords; canonical; hreflang set (exact URLs) + x-default; exactly one h1; CIN visible; link to Book + `data-cta="book"`; Hostaway widget (exactly one on Book, ≤ 1 elsewhere, correct listing/baseUrl); img alt/width/height; no non-allowlisted third-party hosts, no Google Fonts; no hidden text; no placeholders (`TODO`, `TBD`, `lorem`, `undefined`…); banned claims in all languages; valid JSON-LD with `VacationRental` on home, no ratings; internal links resolve; CNAME, robots, sitemap contents; legacy `?lang=` redirect; image and JS budgets; unconfirmed photos not shipped; translation review flags (warn; fail with `--strict`). |
| `npm run check:visual` | Serves `dist/`, opens every required page at 390×844 and 1440×900: HTTP 200, no horizontal overflow, no broken images or failed requests, no console errors from our code, sticky booking button visible mid-page, small tap targets (warn), Hostaway container on Book, axe-core accessibility (serious/critical = fail). Saves full-page screenshots. Options: `--only=<pageId>`, `--no-shots`. |
| `npm run todo` | Lists facts the owner must supply (`TODO_OWNER`), facts to confirm (`verified: false`) and unconfirmed photos. Paste into the build report. |

A FAIL must be fixed in the site, never by editing the checker. If a check is genuinely wrong, explain why in the build report and fix the checker minimally.

---

## 12. Deployment

- `.github/workflows/deploy.yml` builds, runs `verify --strict` and `check:visual --no-shots`, then deploys to GitHub Pages. Do not deploy by other means.
- The owner sets **Settings → Pages → Source: GitHub Actions**, and the custom domain `www.dolceazzurra.com` with "Enforce HTTPS".
- DNS at Nuxit (owner): `CNAME www → <github-username>.github.io` and four `A` records for the apex (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) so the bare domain redirects to `www`. Remove old records that conflict.
- Until the owner has proofread, `--strict` fails in CI and nothing deploys. That is expected; tell the owner which files need `reviewed: true`.
