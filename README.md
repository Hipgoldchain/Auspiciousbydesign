# Auspicious by Design — The Corona Family Collection

A private online showroom for a collection of antique Tibetan painted furniture, gathered over two decades in Kathmandu, Nepal.

**Live site:** _(once deployed)_ https://hipgoldchain.github.io/Auspiciousbydesign/

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
│   ├── catalogue.js        All 81 plate entries (data)
│   └── app.js              Renders, filters, search, modal, form
└── images/
    ├── plates/             Full-size photographs (1200px max)
    ├── thumbs/             Card thumbnails (600px max)
    └── landscapes/         Hero + section backgrounds
```

## Features

- **Full catalogue of 81 plates** across four categories: Monastic Trunks & Boxes, Leather Trunks, Cabinets & Altars, Tables
- **Filter by category and period**, plus free-text search
- **Click any piece** to open a detail modal with description and dimensions
- **Enquiry form** that opens the visitor's mail client pre-filled and addressed to `info@antiquetibetanfurniture.com`
- **Mobile-optimised navigation** with a slide-in drawer
- **Lazy-loaded images** so the site stays fast even with the full catalogue

## Image status

18 plates currently have real photographs (extracted from the v4 preview PDF). The remaining plates display an elegant placeholder card with the description and dimensions visible. **To add a photograph for any plate:**

1. Save the photo as `plate_NN.jpg` in `images/plates/` (where `NN` is the zero-padded plate number, e.g. `plate_14.jpg`)
2. Save a thumbnail version (max 600px wide) of the same name in `images/thumbs/`
3. In `js/catalogue.js`, find the matching plate and change `hasImage: false` to `hasImage: true`
4. Commit and push — GitHub Pages will redeploy automatically

Recommended specs: JPEG, 1200px wide for `plates/`, 600px wide for `thumbs/`, ~80–85% quality.

## Deploying to GitHub Pages

The repo is already created at `Hipgoldchain/Auspiciousbydesign`. To deploy:

1. **Clone the repo locally**
   ```bash
   git clone https://github.com/Hipgoldchain/Auspiciousbydesign.git
   cd Auspiciousbydesign
   ```

2. **Copy these files in** (everything in this build) so the structure matches the tree above.

3. **Commit and push**
   ```bash
   git add .
   git commit -m "Initial showroom site"
   git push origin main
   ```

4. **Enable GitHub Pages**
   - Go to the repo's **Settings → Pages**
   - Under **Source**, select **Deploy from a branch**
   - Choose **`main`** branch, **`/ (root)`** folder
   - Click **Save**
   - Wait ~1 minute, then visit `https://hipgoldchain.github.io/Auspiciousbydesign/`

5. **Optional: custom domain.** If you want to use a subdomain like `collection.kachalinta.com`:
   - In Pages settings, enter the domain
   - Add a `CNAME` DNS record at your domain registrar pointing to `hipgoldchain.github.io`
   - GitHub will provision an HTTPS certificate automatically

## Local development

The site is plain HTML / CSS / JS — no build step. To preview locally:

```bash
# Any simple HTTP server works
python3 -m http.server 8000
# Then open http://localhost:8000
```

Opening `index.html` directly in the browser (`file://`) also works, but a local server is recommended because some browsers handle relative paths and images differently under `file://`.

## Editing content

- **Catalogue entries** live in `js/catalogue.js` — easy to edit titles, descriptions, dimensions
- **Story text** lives in `index.html` inside the `<section class="story">` block
- **Contact details** are in two places: `index.html` (the contact section) and `js/app.js` (the mailto fallback)

## Credits

- **Collection:** Luca Corona & family
- **Text:** Camilla Corona
- **Photography:** Kishore Mahajan & Hari Mahajan
- **Web build:** May 2026

> _May the rich heritage, arts & culture of Tibet be preserved._
