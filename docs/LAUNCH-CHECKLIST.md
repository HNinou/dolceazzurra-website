# Launch checklist (owner)

Things Claude Code cannot do for you. Tick them off as you go.

## Before the build
- [ ] Create the GitHub repository (public), e.g. `villa-website`, and copy this whole kit into it.
- [ ] In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
- [ ] Fill in the `TODO_OWNER` values in `content/villa.yaml` you can already answer (run `npm run todo` to list them).
- [ ] Confirm or correct the `verified: false` facts (map pin, roof terrace, restaurants).
- [ ] Decide which Alassio photos you have the rights to. Set `rights: owner` or `licensed` in `content/photos.yaml` only for those.

## Proofreading (blocks deployment until done)
- [ ] Read every page in **English, French and Italian** (`npm run dev`, then open http://localhost:4321).
- [ ] For each file you approve, set `reviewed: true` in `src/content/pages/<lang>/*.md` and `"_reviewed": true` in `src/i18n/<lang>.json`.
- [ ] Check the Privacy page and the Legal page carefully (or have them checked).

## Hostaway
- [ ] Confirm the booking website `dolceazzurra.holidayfuture.com` is published and listing **572451** is the villa.
- [ ] Style it with the site colours (`#2F5D7C` buttons, `#F4EFE8` background) and logo.
- [ ] Give it the address `book.dolceazzurra.com` (Hostaway: Booking Website → Settings → Domain & Security → Own subdomain; Nuxit: CNAME `book` → the proxy shown by Hostaway; reCAPTCHA v2 keys). The site already points there.
- [ ] Turn on **Google Vacation Rentals** in Hostaway.
- [ ] After launch: make a full test booking (or inquiry) from the live site, on a phone and a computer.

## Domain (Nuxit DNS zone)
- [ ] `CNAME` record: `www` → `<your-github-username>.github.io`
- [ ] Four `A` records for the bare domain (`@`): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- [ ] Delete old `A`/`CNAME` records for `@` and `www` that point elsewhere.
- [ ] In GitHub Pages settings: custom domain `www.dolceazzurra.com`, wait for the DNS check, then tick **Enforce HTTPS**.
- [ ] Check GitHub's current "Managing a custom domain" page in case the IPs changed.

## After launch
- [ ] Open the live site and check the Hostaway calendar shows prices and availability.
- [ ] Google Search Console: add the domain, submit `https://www.dolceazzurra.com/sitemap-index.xml`.
- [ ] Add the website link to Instagram (@dolce.e.azzurra), the welcome book, the Wi-Fi card and the Hostaway guest guide.
- [ ] Update Airbnb: it still lists the carbon monoxide detector as unavailable.
- [ ] Ask Giordano Hadamik Architects to link their project page to the site.
- [ ] Send hero-quality originals (≥ 2400 px wide) of photos 01, 04, 08 and 16 when you have them.
- [ ] When a native German (then Dutch) proofreader is ready: ask Claude Code to write the DE draft, have it reviewed, set `status: live` for `de` in `villa.yaml`.
