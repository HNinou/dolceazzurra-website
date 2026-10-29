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
- **Minimum stay:** confirmed by the owner (28 Oct 2026); shown next to both calendars.
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
3. ~~**CI build failure (2026-10-27).**~~ Fixed: Astro 7 requires Node ≥ 22.23.4, but the workflow pinned Node 20, so `npm run build` failed on GitHub. The workflow now uses Node 24 (same as the owner's Mac), with `actions/checkout@v5` and `actions/setup-node@v5`. `package.json` engines are updated to match.
4. **Domain.** Switched from `www.dolce-azzurra-alassio.com` (never registered) to the owner's domain, `www.dolceazzurra.com` (registered at Nuxit). Changed in `content/villa.yaml`, `public/CNAME`, `public/robots.txt`, `CLAUDE.md` and `docs/LAUNCH-CHECKLIST.md`. `reference/old-site.html` is left as it was.
5. **Booking subdomain (2026-10-27).** `villa.yaml` → `booking.base_url` and `listing_url` now point to `https://book.dolceazzurra.com/`. The Hostaway widget fetches its data from `booking-engine.hostaway.com/bookingEngines/<booking host>/…`, which returns 403 until the subdomain is saved in Hostaway (Booking Website → Settings → Domain & Security → Own subdomain). **Do not push this change before Hostaway is configured**, or the calendar stays empty. To roll back, put `dolceazzurra.holidayfuture.com` back in both URLs.
6. GitHub → Settings → Pages → Source: GitHub Actions, then DNS at Nuxit (see `LAUNCH-CHECKLIST.md`).

## Website review (27 Oct 2026, "dolceazzurra.com — Website Review", 68/100)
Implemented:
- Desktop hero: pergola over the bay (01); phones keep the dusk photo (04). Both share one description ("The bay of Alassio seen from the villa"). Award line removed from the hero.
- Photo 08 (house) now opens The Villa page and follows the Home intro, as a panoramic strip cropped from the bottom so the neighbouring houses drop out.
- "Evening" moment uses the lit pool (52), with new text. The Home Alassio teaser and the Alassio page now show Alassio at night from the villa (51). The phone booking band shows the breakfast table over the sea (05), not the rosemary close-up. 04 is already the phone hero, so it wasn't reused there.
- Gallery: 09, 13, 15 and 20 restored (owner's choice), 14 and 21 added. The gallery opens on 01, then pool, interiors, suites, architecture. Grid kept clean, with no captions under tiles (owner's choice); captions show in the full-screen viewer.
- Alassio second heading rewritten. The price-only closing bands are now "Check availability" + price + button (owner found "Your dates, our view" too much).
- Minimum-stay line next to both calendars. After the 20th, the calendar opens on next month: the widget has no start-month setting, so the page clicks its "next" arrow once.
- WhatsApp "Ask a question" (Italian number +39 340 832 3475; the French one does not work on WhatsApp) in the hero, on the Book page and in the footer.
- The rating links to the Airbnb listing so guests can check it (owner's choice; note this deliberately relaxes CLAUDE.md rule 3, "one booking path").
- Phones: "Made for eight" is a swipeable row; reviews show two, then "More reviews". Fade-ins shortened to 0.25 s and started before elements reach the screen.

- "Your hosts" (2026-10-27): the owners' own French text (Sylvie and Michel) sits on The Villa page before the closing band, translated into EN and IT, with their photo (59, cropped tight to 4:5 from IMG_4105.heic; the HEIC original stays out of git) beside it. "à couper le souffle" became "imprenable" (the verifier bans it as a hype word). "No vis-à-vis" is the owners' wording and holds: no other house is visible from the villa.

Not done (needs the owner): photos of all four suites and more bathrooms; courtyard and roof terrace photos; licensed Alassio photos; deposit and cancellation terms; German then Dutch; lifestyle shoot; Google reviews.

## Owner material, 27 Oct 2026 (evening)
- **Email:** `contact.email` is now `stay@dolceazzurra.com` (MX at ImprovMX, so mail is forwarded; the owner should send a test message).
- **Removed, not true:** the fireplace lounge under the olives (villa.yaml space, translations, copy brief) and the welcome gift (olive oil and Alta Langa, "Welcome gift" in the included list). The wine cellar line moved to the Kitchen amenities. The "Ligurian apero box" stays: it is a paid service on request, not a gift.
- **Booking address:** book.dolceazzurra.com now has a valid Let's Encrypt certificate (issued 27 Oct 2026, expires 25 Jan 2027; Hostaway renews it).
- **HD photos:** the owner's professional shoot (110 files, `UMDC_VILLA_DOLCE_&_AZZURRA-*.jpg`, 5000 px) replaced the Airbnb copies of 01, 06-23, 43, 47, 49 and 52 (11, 15 and 18 were only 1280 px). Masters are resized to 2560 px in `src/assets/photos`; Astro makes the AVIF/WebP sizes for each screen as before. New: 60 and 61 (two more suites) and 62 (a second bathroom). The Villa page now shows all four suites (22, then 60, 20, 61). Photographer credit for "UMDC" not added: name unknown.
- **Floor plan:** a simplified SVG (`src/components/FloorPlan.astro`) traced from the architects' drawings, numbered with a legend, on The Villa page after the suites. Rooms, the hallway behind the suites, the entrance and its passage into the living room, the guest WC and the service strip follow "FLOOR PLAN_POTENTIAL"; the pool follows "FLOOR PLAN_PLANNING" (owner asked for it), scaled to its labelled 10 × 3 m, with its terrace. The guest WC (about 2 × 2 m, full depth of the service strip) follows the owners' later 3D render, which differs from the PDF. The storage room at the far end of the suites hallway is drawn as hallway (owner's request). No dimensions.
- **Hero film (owner's request; the spec said no autoplay video):** `public/video/villa-dolce-azzurra-1920.mp4` (3.9 MB) and `-1280.mp4` (2.1 MB), H.264, no sound, from the owner's 39 MB file. Only on screens from 60rem, chosen by screen width × pixel density; not downloaded on phones, with reduced motion or Save-Data. Muted, looped, with a pause button (WCAG 2.2.2). The pergola photo stays underneath until the film plays.

## German version (27 Oct 2026)
- `de` is `live` in `villa.yaml` (owner's request): 8 pages in `src/content/pages/de/`, `src/i18n/de.json` (UI strings, photo descriptions, translated villa.yaml facts), German review texts for Noé and Philipp (Delia's and Martin's are already German, shown in the original), German WhatsApp greeting, „…“ quotation marks, calendar fallback link to `book.dolceazzurra.com/de/…`.
- Formal "Sie", standard German spelling (ß), so it reads naturally in Germany and Switzerland.
- The spec says draft locales go live only after a native speaker has reviewed them. The owner chose to publish first: every German file is still `reviewed: false`, so a native proofread is the next step.
- The Hostaway calendar's own labels ("Select check-in and check-out dates", weekday names) stay in English in every language; they come from Hostaway's script, not from the site.
- Dutch (`nl`) stays a draft.

## Front page rework (28 Oct 2026)
- **Rates:** `rates.all_inclusive: false`, `rates.cleaning_fee: 440` (EUR per stay); "Final cleaning" left the included list. Minimum stays are `confirmed` (July–August 7 nights Saturday to Saturday; April–June, September–October 3 nights). `legal.cancellation_policy` filled: 100% refund up to 14 days before arrival, 50% up to 7 days. Every "everything included" / "tout compris" / "tutto incluso" / "alles inklusive" is gone; prices now read "from €700 a night for up to 8 guests (about €88 per person per night), plus a €440 final cleaning fee per stay". Copy brief and CLAUDE.md updated to match.
- **Home order:** hero (with "Sleeps 8 · from €700 a night" from villa.yaml) → facts strip (8 guests · 4 suites · 5 bathrooms · single level · infinity pool · beach 10 min) → gallery strip → "The villa in three points" (suites 60, living 18, outside 16) → Alassio teaser with a 5-row distance table → reviews (two, then "More reviews" on every screen; rating linked to Airbnb) → architecture + award + short "Your hosts" linking to The Villa → booking band (price + cleaning fee, minimum stay and cancellation next to the calendar, included list) → footer.
- The review is saved as `docs/front-page-review.md` (text of the owner's PDF). Its texts are applied: the three points, "Completed in 2026.", and "Linen, towels, Wi-Fi, pool and parking included." under the price. Home meta descriptions replaced with the owner's four texts (all under 160 characters).
- "A day here" and "Who it's for" moved to The Villa page (after Outdoors, and before Your hosts). Friends card: "All four suites have the same queen bed and their own outdoor space."
- The pull quote and its "after Giordano Hadamik Architects" line are removed (not the architects' wording). The 08 panorama strip is no longer on the home page (it still opens The Villa page).
- Book page: minimum stay and cancellation sit in the left column next to the calendar (shared `BookingTerms` component); the lower "Minimum stay" block is gone.
- Footer: "Life as it should be" removed (also from villa.yaml); the footer reads "Solva Cavia · Alassio · Liguria".
- Hero film re-cut to start on the pergola view over the bay; the house-front shots now come last (`public/video/villa-dolce-azzurra-bay-*.mp4`, 3.9 MB and 2.1 MB).
- All changed pages and UI strings are `reviewed: false`.

## New owner photos (29 Oct 2026)
- Added to the gallery: 64 kitchen with the bay (interiors), 65 suites hallway (interiors), 66 covered patio and outdoor kitchen (outdoors), 67 the villa at sunset among olive trees (architecture, 1264 px, gallery only), 68 stone passage (architecture). Alt texts in EN/FR/IT/DE.
- Swaps: home "Living with the view" uses 64 (was 18); The Villa uses 66 before "Outdoors" (was 57) and 68 beside the materials paragraph (was the night aerial 07, still in the gallery).
- A sixth photo (sunset over the pool) was not added: it shows signs of AI generation (smeared stone texture, a ghost figure in the window reflections). Owner rule: no AI-generated images.

## Pool, footpath and gallery sizes (29 Oct 2026)
- **Salt-water pool** confirmed by the owner: `salt_water: true` (the verifier's salt-water ban only applies when it isn't). Mentioned in the pool amenity and the home "Outside" point, in all languages. Copy brief and CLAUDE.md rule updated.
- **Footpath:** a path leads down to Alassio beach in about 20 minutes on foot. In villa.yaml (`location.walks`), the home Alassio teaser, the Alassio "Walks" section and the Book FAQ.
- **Gallery:** photos under 1600 px wide (here 67, the villa at sunset) never take the full-width last tile and show at most half their pixel width in the viewer, so they stay sharp. New `display: tile` in photos.yaml shows a portrait photo in a normal landscape tile; used for the lavender (58).

## Remaining warnings
- Translation review flags (27 files). These are expected until the owner proofreads.
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
