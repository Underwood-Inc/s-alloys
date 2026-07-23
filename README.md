# s-alloys — public site

GitHub Pages companion for the **Alloys** Minecraft 26.2 datapack. Source gameplay code lives in a private repo; this repo hosts:

- **Interactive QA** (`/qa/`) — installable **PWA** with CSV/JSON import & export
- **Player guide** (`/guide/`) — Starlight docs (build separately)

Live site: [underwood-inc.github.io/s-alloys](https://underwood-inc.github.io/s-alloys/)

## PWA & icons

Icons are generated from the hand-painted Alloys resource-pack icon (`alloys/tools/handcrafted/pack-icon.mjs`) — the same four-ingot artwork used on the companion resource pack.

```powershell
npm run build:icons
```

The QA checklist registers a service worker for offline use. Install via browser **Add to Home Screen** / **Install app**.

## Maintainer sync (private `alloys` repo)

From the private alloys checkout:

```powershell
# Regenerate case catalog from Cursor canvas
node tools/_extract-qa-cases-from-canvas.mjs

# Build JSON + icons in sibling s-alloys checkout
cd ..\s-alloys
npm run build
```

### Optional submodule

```powershell
cd path\to\alloys
git submodule add git@github.com:Underwood-Inc/s-alloys.git s-alloys
```

Then point `_extract-qa-cases-from-canvas.mjs` output at `s-alloys/scripts/qa-cases-data.mjs` (already configured for `../s-alloys`).

## QA CSV export

**File → Export progress (CSV)** writes:

- Metadata rows (`# tester_name`, `# datapack_version`, `# reviewed_count`, …)
- One row per case with current `verdict`, `notes`, and `updated_at`

Share the CSV with your team; they can **Import progress (CSV)** to merge state by `case_id`.

## Guide (Starlight)

Coming soon: `guide-src/` with Astro Starlight, built to `guide/` for GitHub Pages.

```powershell
cd guide-src
npm install
npm run build
```

## Deploy

Push to `master`. GitHub Pages serves from repository root (`/(root)`).
