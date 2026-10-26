# Build report

Claude Code updates this file at the end of every phase (see CLAUDE.md section 10).

## Status
| Phase | Status | Gate result | Date |
| --- | --- | --- | --- |
| 0. Setup | done | build + verify PASS | 2026-10-26 |
| 1. Design system | done | check PASS, screenshots reviewed | 2026-10-26 |
| 2. English content | done | check PASS, screenshots reviewed | 2026-10-26 |
| 3. FR + IT | done (`reviewed: false`) | check PASS, fr/it screenshots reviewed | 2026-10-26 |
| 4. SEO polish | done | check PASS | 2026-10-26 |
| 5. Deploy | **not done**, see "Deploy blockers" | | |

Last run (2026-10-26): `npm run verify` 1145 checks passed, 52 warnings, 0 failures, PASS.
`npm run check:visual` 192 checks passed, 6 warnings, 0 failures, PASS.
`npm run verify -- --strict` fails until the owner proofreads (27 files with `reviewed: false`). That's intended.

## What was built
- Astro 7 static site, plain CSS tokens (`src/styles/tokens.css`), self-hosted Fraunces + Inter (Fontsource), no third-party requests except the Hostaway widget.
- 8 pages × EN/FR/IT + 404, with canonical, hreflang (+ x-default), OG/Twitter tags, unique titles and descriptions.
- Components: Header (transparent over the home hero, solid on scroll, full-screen `<dialog>` menu on mobile), Footer (contact, address, CIN, company + VAT, architect credit), StickyCta (mobile bar, hidden on Book), Hero, FactsStrip, AwardLine, Figure, Section, Gallery + Lightbox (`<dialog>`, Esc/arrows/swipe), BookingWidget, Faq (`<details>`), DistanceTable, ServiceCard, Logo (sunset mark rebuilt as inline SVG).
- Hostaway widget: config injected from `villa.yaml`, script loaded only when the widget nears the viewport, 1 month under 700px, localized fallback link to the listing.
- `VacationRental` JSON-LD on each home page (12 photo URLs, address, geo, occupancy, rooms, amenities; no ratings).
- OG images: `/og/en.jpg`, `/og/fr.jpg`, `/og/it.jpg` (1200×630), cropped from photo 01 at build time by `src/pages/og/[locale].jpg.ts`.
- Legacy redirect: inline script on `/` sends `/?lang=fr|it` to `/fr/` or `/it/` (only live locales).
- Sitemap with i18n alternates (404 excluded), `robots.txt`, `CNAME`.

## Decisions
- **Facts stay in `villa.yaml`.** Copy uses `{tokens}` (e.g. `{priceLow}`, `{guests}`, `{altitude}`) filled from `villa.yaml` by `fill()` in `src/lib/villa.ts`. An unknown or `TODO_OWNER` token fails the build.
- **Translating yaml text.** Free-text facts (amenities, spaces, services, distances…) are written in English in `villa.yaml`. Their FR/IT versions live in `src/i18n/<lang>.json` → `"yaml"`, keyed by the English text. If someone edits an English line in `villa.yaml` without updating the translations, the build stops and names the missing line, so English never slips onto FR/IT pages unnoticed.
- **Page copy** is in `src/content/pages/<lang>/<page>.md` frontmatter (structured sections). Only the Privacy page uses the Markdown body. Loaded with `import.meta.glob` instead of content collections (simpler, no schema needed).
- **Restaurants:** none are `verified`, so the Alassio page has an "Eating out" section with no names ("ask us for our list"). Names will appear automatically once set to `verified: true`.
- **Minimum stay:** every rule is `proposed`, so the Book page says "Minimum stay varies by season, see the calendar."
- **Deposit, cancellation, payment, tourist tax:** all `TODO_OWNER`, so nothing is shown. Each one appears on the Book page once filled in.
- **FAQ:** the children-policy, pets and payment/deposit questions are left out because those facts are missing. "Nearest shops" says only "in Alassio, below the villa" because no distance is known.
- **Direct-booking line** ("no platform fees, apero box on arrival") is left out: the copy brief says the owner must confirm the gift first.
- **Roof terrace** (`verified: false`) appears in the Villa outdoors list. Remove it from `villa.yaml` if it's wrong.
- **Salt-water pool:** not mentioned anywhere.
- **Architect quote:** a one-sentence paraphrase of the architects' idea, credited and linked, not a verbatim quote. The Villa page's architecture story is paraphrased and says so.
- **Hostaway privacy link:** `https://www.hostaway.com/privacy-policy/`. Owner, please check that this URL still works.
- **Widget font:** `'Open Sans'` as in the spec. Hostaway falls back to a serif in local tests. If the live calendar looks wrong, change `font` in `src/components/BookingWidget.astro` to another font Hostaway supports.
- **Gallery layout:** each group picks 2, 3 or 4 columns on desktop so its rows fill with no orphan tiles.
- **Colours:** added `--c-bay-deep` (button hover) and `--c-olive-deep` (`#5A6044`, olive for small text). The spec's `--c-olive` fails AA contrast for small text on `--c-surface`.
- The browser check's "small tap targets: BUTTON" warnings on Home and Book (mobile) come from the Hostaway calendar's own month arrows, which are third-party.
- Lighthouse was not run.

## Deploy blockers (phase 5)
1. ~~**Kit location.**~~ Resolved: the kit's contents now sit at the repository root, so `.github/workflows/deploy.yml` will run on push. The kit README replaced the 2-line stub README, and `.DS_Store` files are no longer tracked. All checks re-run from the root and pass.
2. **Proofreading.** *Temporarily relaxed (2026-10-27, owner's request, for a test deploy):* CI now runs `npm run verify` without `--strict`, so unreviewed pages only warn. The `reviewed: false` markers are kept. To restore the gate, put `-- --strict` back in `.github/workflows/deploy.yml`. Files still to proofread and mark `reviewed: true` (or `"_reviewed": true`):
   - `src/content/pages/{en,fr,it}/{home,villa,gallery,alassio,services,book,legal,privacy}.md`
   - `src/i18n/{en,fr,it}.json`
3. GitHub → Settings → Pages → Source: GitHub Actions, then DNS at Nuxit (see `LAUNCH-CHECKLIST.md`).

## Remaining warnings
- Translation review flags (27 files). These are expected until the owner proofreads.
- The gmail address shows on every page (`contact.email`). Switch it when the domain address exists.
- Small tap targets inside the Hostaway widget (third-party).

## Owner to-do
(output of `npm run todo`, 2026-10-26)

### Missing facts (TODO_OWNER): 12
- [ ] legal.tourist_tax
- [ ] legal.security_deposit
- [ ] legal.cancellation_policy
- [ ] legal.payment_terms
- [ ] contact.phones.0.whatsapp
- [ ] contact.phones.1.whatsapp
- [ ] rates.season_dates
- [ ] rates.minimum_stay.winter_monthly_rate.price
- [ ] house.pets
- [ ] house.children_policy
- [ ] house.spaces.pool.salt_water
- [ ] house.reviews.quotes

### Facts from a single source, to confirm: 7
- [ ] legal.geo
- [ ] house.spaces.roof-terrace
- [ ] location.restaurants.La Prua
- [ ] location.restaurants.La Vigna
- [ ] location.restaurants.Ristorante Panama
- [ ] location.restaurants.La Lanterna
- [ ] location.restaurants.Sabbia Vino e Cucina

### Photos with unconfirmed rights (not published): 18
- [ ] 24-baie-alassio-balcon.webp … 41-carte-des-sentiers-de-randonnee-solva-cavia-monte-castellaro.webp (all destination photos; see `content/photos.yaml`)

### Also to confirm
- [ ] The direct-booking gift (Ligurian apero box) before the "Book direct" line is added.
- [ ] The Hostaway privacy-policy URL on the Privacy page.
- [ ] The Legal and Privacy pages, checked by you or an advisor.
