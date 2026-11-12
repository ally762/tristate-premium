# Tristate Classic Car Restoration — premium website

Plain HTML + CSS + JavaScript (no frameworks). Every page keeps the original URL, `<title>`,
meta description, canonical, Open Graph tags, schema, headings and content.

- **Hero**: real restored cars (slideshow) with the client's lead form.
- **1970 Dodge Challenger story**: scroll-scrubbed photo flipbook from the shop's Facebook album.
- **Transformations**: before/after cards — move the mouse (or drag / tap on phones) to wipe.
- **From the Shop Floor**: draggable strip of Facebook album photos.
- Fonts: Cormorant Garamond + Archivo. Colours: black, bone ivory and one deep red.

```
index.html, <slug>/index.html    all pages (same URLs as before)
assets/css/style.css             theme
assets/js/main.js                interactions
assets/img/site/                 optimised photos (hero, story, before/after, shop floor)
assets/img/uploads/              original site images & testimonial videos
```

Preview locally:

```bash
python -m http.server 8000
```

## Contact forms
GitHub Pages has no server. In `assets/js/main.js` set `FORM_ENDPOINT` to a form service
URL (Formspree, Getform, Basin…) to receive submissions by e-mail. While empty, the form
opens the visitor's e-mail app addressed to gc@tristateclassiccarrestoration.com.
