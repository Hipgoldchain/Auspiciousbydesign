# Auspicious by Design — The Corona Family Collection

A private online showroom for a collection of antique Tibetan painted furniture, gathered over two decades in Kathmandu, Nepal.

**Live site:** https://antiquetibetanfurniture.com

---

## What's in the repo

```
.
├── index.html              The site
├── 404.html                Friendly fallback
├── .nojekyll               Tells GitHub Pages to skip Jekyll processing
├── css/
│   └── style.css           Stylesheet
├── js/
│   ├── catalogue.js        All 82 plate entries (data)
│   └── app.js              Renders, filters, search, modal, form
└── images/
    ├── plates/             Full-size photographs (1200px max)
    ├── thumbs/             Card thumbnails (600px max)
    └── landscapes/         Hero + section backgrounds
```

## Features

- **Full catalogue of 82 plates** across four categories: Monastic Trunks & Boxes, Leather Trunks, Cabinets & Altars, Tables
- **Filter by category and period**, plus free-text search
- **Click any piece** to open a detail modal with description and dimensions
- **Sold indicators** — pieces that have been sold display a badge on the card and in the modal
- **Enquiry form** that opens the visitor's mail client pre-filled and addressed to `info@antiquetibetanfurniture.com`
- **Mobile-optimised navigation** with a slide-in drawer
- **Lazy-loaded images** so the site stays fast even with the full catalogue

## Image status

19 plates currently have real photographs. The remaining plates display an elegant placeholder card with the description and dimensions visible. **To add a photograph for any plate:**

1. Save the photo as `plate_NN.jpg` in `images/plates/` (where `NN` is the zero-padded plate number, e.g. `plate_14.jpg`)
2. Save a thumbnail version (max 600px wide) of the same name in `images/thumbs/`
3. In `js/catalogue.js`, find the matching plate and change `hasImage: false` to `hasImage: true`
4. Commit and push — Vercel will redeploy automatically

Recommended specs: JPEG, 1200px wide for `plates/`, 600px wide for `thumbs/`, ~80–85% quality.

## Sold pieces

The following plates are marked as sold. A brick-red "Sold" badge appears on the catalogue card and inside the detail modal.

| Plate | Code  | Title              |
|-------|-------|--------------------|
| 13    | SB126 | "Lhoka Box"        |
| 27    | SB151 | Monastic Box       |
| 50    | SC388 | Kham Cabinet       |
| 52    | SC837 | Kham Altar Cabinet |
| 75    | SC386 | Yangam Cabinet     |
| 95    | ST623 | Table              |

To mark another piece as sold, find its entry in `js/catalogue.js` and add `sold: true`.

## Deployment

The site is hosted on **Vercel**, connected to the GitHub repo [`Hipgoldchain/Auspiciousbydesign`](https://github.com/Hipgoldchain/Auspiciousbydesign). Every push to `main` triggers an automatic production deployment to `antiquetibetanfurniture.com`.

| Service | URL |
|---------|-----|
| Production | https://antiquetibetanfurniture.com |
| Vercel dashboard | https://vercel.com/alexander-coronas-projects/auspicious-by-design |
| GitHub repo | https://github.com/Hipgoldchain/Auspiciousbydesign |

To make changes:

```bash
git clone https://github.com/Hipgoldchain/Auspiciousbydesign.git
cd Auspiciousbydesign
# edit files
git add .
git commit -m "Describe your changes"
git push origin main
# Vercel auto-deploys on push
```

## Local development

The site is plain HTML / CSS / JS — no build step. To preview locally:

```bash
python3 -m http.server 8000
# Then open http://localhost:8000
```

## Editing content

- **Catalogue entries** live in `js/catalogue.js` — easy to edit titles, descriptions, dimensions
- **Marking a piece as sold:** find the plate in `js/catalogue.js` and add `sold: true` to the entry
- **Story text** lives in `index.html` inside the `<section class="story">` block
- **Contact details** are in three places: `index.html` (the contact section), `js/app.js` (the mailto fallback), and this README

## Credits

- **Collection:** Luca Corona & family
- **Text:** Camilla Corona
- **Photography:** Kishore Mahajan & Hari Mahajan
- **Web build:** May 2026

> _May the rich heritage, arts & culture of Tibet be preserved._
