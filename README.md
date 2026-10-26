# Villa Dolce & Azzurra: website starter kit

Everything Claude Code needs to build the villa's website from scratch and check its own work.

## How to use it

1. Create an empty **public** repository on GitHub (for example `villa-website`) and clone it to your Mac.
2. Copy **everything in this folder** into the cloned repository, including the hidden folders `.github` and `.claude`
   (in Finder, press Cmd+Shift+. to show hidden files). Commit and push.
3. On GitHub: **Settings → Pages → Source: GitHub Actions**.
4. Install Node.js LTS if you haven't (nodejs.org).
5. Open the repository folder in Claude Code (the Code tab in the Claude app, or `claude` in Terminal) and type:

   ```
   /build-site
   ```

   Claude Code reads `CLAUDE.md`, builds the site phase by phase, and runs the checks after each phase.
   At any time you can type `/verify` to re-run all checks and fix what fails.
6. Proofread the English, French and Italian pages, then mark them reviewed (see `docs/LAUNCH-CHECKLIST.md`).
   The site only deploys once they are marked reviewed.
7. Follow the rest of `docs/LAUNCH-CHECKLIST.md` (domain at Nuxit, Hostaway, Google).

## What's inside

| Path | Purpose |
| --- | --- |
| `CLAUDE.md` | The full build spec Claude Code follows: rules, stack, design, pages, booking widget, SEO, phases, checks |
| `content/villa.yaml` | All the villa's facts in one place. Edit facts here, never in the pages |
| `content/photos.yaml` | Photo list with rights, alt text and use |
| `content/copy-brief.md` | Tone of voice, banned claims, page outlines |
| `assets/photos/`, `assets/brand/` | Your photos and logo |
| `reference/` | Old website (content source only) and the architect's story |
| `scripts/verify.mjs` | Automatic checks on the built site (SEO, languages, legal CIN, claims, links, images…) |
| `scripts/visual-check.mjs` | Browser checks + screenshots on phone and desktop sizes, accessibility scan |
| `scripts/owner-todo.mjs` | Lists the facts you still need to provide (`npm run todo`) |
| `.github/workflows/deploy.yml` | Builds, checks and publishes to GitHub Pages on every push |
| `.claude/commands/` | `/build-site` and `/verify` shortcuts for Claude Code |
| `docs/` | Strategy summary, launch checklist, build report |

## Facts still missing

Run `npm run todo` (after `npm install`) or read the `TODO_OWNER` lines in `content/villa.yaml`:
tourist tax, deposit, cancellation and payment terms, season dates, pets and children policy,
salt-water pool (yes/no), WhatsApp numbers, real guest review quotes, and rights for the Alassio photos.
