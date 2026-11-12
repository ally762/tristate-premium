# Tristate Classic Car Restoration — static website

Plain HTML + CSS + JavaScript, with a three.js 3D Dodge Challenger–style showroom.
Every page keeps the same URL, `<title>`, meta description, canonical, Open Graph tags,
Yoast JSON-LD schema, headings and body content as the original WordPress site.

## Structure

```
index.html                  Home (full-screen 3D hero)
<slug>/index.html           Every other page/post, same URL as before (e.g. /about-us/)
assets/css/style.css        Theme (logo palette: lime #8fd43d, red #e3261f, chrome, black)
assets/js/main.js           Menu, animations, gallery lightbox, before/after sliders, forms
assets/js/challenger.js     three.js 3D car (loaded from cdn.jsdelivr.net, three@0.160.0)
assets/img/uploads/         All images and testimonial videos from the old site
sitemap.xml, robots.txt, 404.html, .nojekyll
```

## Preview locally

ES modules don't run from `file://`, so open it through a tiny local server:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000

## Publish on GitHub Pages

1. Push this folder to a GitHub repository (root of the repo).
2. Repository → Settings → Pages → Source: *Deploy from a branch* → `main` / `root`.
3. Custom domain: enter `tristateclassiccarrestoration.com` (GitHub creates a `CNAME` file),
   then point the domain's DNS to GitHub Pages and tick *Enforce HTTPS*.
   Canonical URLs, og:image and the sitemap already use this domain.

## Contact forms

GitHub Pages has no server. Open `assets/js/main.js` and set `FORM_ENDPOINT` to a form
service URL (Formspree, Getform, Basin…) to receive submissions by e-mail. While it is empty,
the forms open the visitor's e-mail app addressed to gc@tristateclassiccarrestoration.com
and then show the /thank-you/ page.
