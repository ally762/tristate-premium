/* Tristate Classic Car Restoration — interactions (vanilla JS, no dependencies) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  /* ----- Form handling -----
     GitHub Pages has no server. Put a form-service URL (Formspree, Getform,
     Basin…) in FORM_ENDPOINT to receive submissions by e-mail. Left empty,
     the form opens the visitor's e-mail app addressed to the shop. */
  const FORM_ENDPOINT = '';
  const SHOP_EMAIL = 'gc@tristateclassiccarrestoration.com';

  /* Header + progress */
  const header = $('.site-header'), bar = $('.scroll-progress');
  const onScroll = () => {
    const y = scrollY;
    header && header.classList.toggle('is-scrolled', y > 40);
    if (bar) { const h = root.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`; }
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Drawer */
  const burger = $('.burger');
  if (burger) {
    const toggle = open => { root.classList.toggle('nav-open', open); burger.setAttribute('aria-expanded', String(open)); document.body.style.overflow = open ? 'hidden' : ''; };
    burger.addEventListener('click', () => toggle(!root.classList.contains('nav-open')));
    $$('.drawer a').forEach(a => a.addEventListener('click', () => toggle(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
  }

  /* Reveal */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: .06 });
  $$('.reveal, .img-reveal').forEach(el => io.observe(el));

  /* swap a lazy <img data-src data-srcset> in */
  function swapIn(im) {
    const pic = im.parentElement && im.parentElement.tagName === 'PICTURE' ? im.parentElement : null;
    if (pic) pic.querySelectorAll('source[data-srcset]').forEach(s => { s.srcset = s.dataset.srcset; delete s.dataset.srcset; });
    if (im.dataset.srcset) im.srcset = im.dataset.srcset; if (im.dataset.src) im.src = im.dataset.src; delete im.dataset.src; delete im.dataset.srcset;
  }

  /* Reviews: equal boxes, click to read the full text */
  $$('.review__more').forEach(b => b.addEventListener('click', () => {
    const r = b.closest('.review'), open = r.classList.toggle('is-open');
    b.setAttribute('aria-expanded', String(open)); b.textContent = open ? 'Show less' : 'Read full review';
  }));

  /* Hero slideshow */
  const hero = $('.hero');
  if (hero) {
    const slides = $$('.hero__slide', hero), dots = $$('.hero__bars button', hero), count = $('.hero__count b', hero);
    const DUR = 6000; let i = 0, timer;
    hero.style.setProperty('--dur', DUR + 'ms');
    const go = k => {
      i = (k + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle('is-active', j === i));
      if (document.readyState === 'complete') [i, (i + 1) % slides.length].forEach(j => { const im = slides[j].querySelector('img[data-src]'); if (im) swapIn(im); });
      else { const im = slides[i].querySelector('img[data-src]'); if (im) swapIn(im); }
      dots.forEach((d, j) => { d.classList.remove('is-active'); if (j === i) { void d.offsetWidth; d.classList.add('is-active'); } });
      if (count) count.textContent = String(i + 1).padStart(2, '0');
      clearTimeout(timer); if (!reduce) timer = setTimeout(() => go(i + 1), DUR);
    };
    dots.forEach((d, j) => d.addEventListener('click', () => go(j)));
    // lazy-load the remaining slides after first paint
    // only the next slide is fetched ahead of time (after the page has loaded)
    addEventListener('load', () => setTimeout(() => { const im = slides[(i + 1) % slides.length].querySelector('img[data-src]'); if (im) swapIn(im); }, 1500));
    go(0);
  }

  /* Challenger flipbook (scroll-scrubbed photo story) */
  const story = $('.story');
  if (story) {
    const frames = $$('.story__frames img', story), chapters = $$('.story__chapter', story);
    const counter = $('.story__counter b', story), fill = $('.story__bar i', story), cap = $('.story__cap', story);
    let loaded = false, cur = -1, ticking = false;
    // load frames progressively: the next few ahead of the current one
    const want = k => { for (let j = k; j < Math.min(frames.length, k + 4); j++) if (frames[j].dataset.src) swapIn(frames[j]); };
    const load = () => { if (loaded) return; loaded = true; want(0); };
    new IntersectionObserver(([e]) => { if (e.isIntersecting) load(); }, { rootMargin: '60% 0px' }).observe(story);
    const update = () => {
      ticking = false;
      const r = story.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
      const k = Math.min(frames.length - 1, Math.floor(p * frames.length));
      if (loaded) want(k);
      if (k !== cur && !(frames[k].complete && frames[k].naturalWidth > 1)) {
        frames[k].addEventListener('load', () => requestAnimationFrame(update), { once: true });
      } else if (k !== cur) {
        frames[cur]?.classList.remove('is-on'); frames[k].classList.add('is-on'); cur = k;
        if (counter) counter.textContent = String(k + 1).padStart(2, '0');
        if (cap) cap.textContent = frames[k].dataset.cap || '';
      }
      let c = 0; chapters.forEach((ch, j) => { if (k >= +(ch.dataset.from || 0)) c = j; });
      chapters.forEach((ch, j) => ch.classList.toggle('is-on', j === c));
      if (fill) fill.style.transform = `scaleX(${p})`;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* Before / after feature (range) */
  $$('.ba-feature').forEach(ba => {
    const r = $('input', ba);
    const set = () => ba.style.setProperty('--p', r.value + '%');
    r.addEventListener('input', set); set();
  });

  /* Before / after cards: pointer scrubs the diagonal wipe */
  $$('.bac').forEach(card => {
    const media = $('.bac__media', card);
    const setP = v => card.style.setProperty('--p', Math.max(0, Math.min(114, v)) + '%');
    const fromEvent = e => { const r = media.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 114; };
    // intro: sweep once when it scrolls into view
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return; o.disconnect();
      if (reduce) { setP(57); return; }
      card.classList.add('is-anim'); setP(114);
      setTimeout(() => setP(57), 80);
      setTimeout(() => card.classList.remove('is-anim'), 1500);
    }, { threshold: .5 }).observe(card);
    media.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || card.dataset.drag) setP(fromEvent(e)); });
    media.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { card.classList.add('is-anim'); setP(57); setTimeout(() => card.classList.remove('is-anim'), 1300); } });
    let sx = 0, sy = 0, decided = false;
    media.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; sx = e.clientX; sy = e.clientY; decided = false; card.dataset.drag = ''; card.classList.add('touched'); });
    media.addEventListener('pointermove', e => {
      if (e.pointerType === 'mouse' || card.dataset.drag === undefined) return;
      if (!decided && Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 8) { decided = true; if (Math.abs(e.clientY - sy) > Math.abs(e.clientX - sx)) delete card.dataset.drag; }
    });
    const end = () => { delete card.dataset.drag; };
    media.addEventListener('pointerup', end); media.addEventListener('pointercancel', end);
    // tap toggles on touch
    media.addEventListener('click', e => { if (!fine) { card.classList.add('is-anim'); const now = parseFloat(getComputedStyle(card).getPropertyValue('--p')); setP(now > 30 ? 0 : 114); setTimeout(() => card.classList.remove('is-anim'), 1300); } });
  });

  /* Draggable horizontal strip */
  $$('.strip').forEach(s => {
    let down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('dragging'); });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - x0; if (Math.abs(dx) > 4) moved = true; s.scrollLeft = l0 - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = false; s.classList.remove('dragging'); });
    s.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  /* Custom cursor label over interactive media */
  if (fine && !reduce) {
    const c = document.createElement('div'); c.className = 'cursor'; document.body.appendChild(c);
    let x = 0, y = 0, cx = 0, cy = 0;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; });
    const loop = () => { cx += (x - cx) * .2; cy += (y - cy) * .2; c.style.left = cx + 'px'; c.style.top = cy + 'px'; requestAnimationFrame(loop); }; loop();
    $$('[data-cursor]').forEach(el => {
      el.addEventListener('pointerenter', () => { c.textContent = el.dataset.cursor; c.classList.add('is-on'); });
      el.addEventListener('pointerleave', () => c.classList.remove('is-on'));
    });
  }

  /* Subtle parallax */
  const par = $$('[data-parallax]');
  if (par.length && !reduce) {
    const tick = () => { par.forEach(el => { const r = el.getBoundingClientRect(); const k = parseFloat(el.dataset.parallax) || .1; el.style.transform = `translate3d(0, ${(r.top + r.height / 2 - innerHeight / 2) * -k}px, 0)`; }); };
    addEventListener('scroll', () => requestAnimationFrame(tick), { passive: true }); tick();
  }

  /* Lightbox */
  const lb = $('.lightbox');
  if (lb) {
    const img = $('img', lb); let list = [], i = 0;
    const show = k => { i = (k + list.length) % list.length; img.src = list[i].dataset.full; img.alt = list[i].querySelector('img')?.alt || ''; };
    $$('[data-lightbox]').forEach(b => b.addEventListener('click', () => { list = $$('[data-lightbox]', b.closest('[data-gallery]') || document); show(list.indexOf(b)); lb.classList.add('is-open'); document.body.style.overflow = 'hidden'; }));
    const close = () => { lb.classList.remove('is-open'); document.body.style.overflow = ''; };
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', () => show(i - 1));
    $('.lb-next', lb).addEventListener('click', () => show(i + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => { if (!lb.classList.contains('is-open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1); });
  }

  /* Lite YouTube */
  $$('.yt').forEach(v => {
    const id = v.dataset.id;
    v.style.backgroundImage = `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`;
    const play = () => { if (v.querySelector('iframe')) return; const f = document.createElement('iframe'); f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`; f.title = v.dataset.title || 'YouTube video'; f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true; v.appendChild(f); };
    v.addEventListener('click', play);
    v.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); } });
  });

  /* Self-hosted videos: load first frame only near viewport; one plays at a time */
  const vo = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; const v = e.target; vo.unobserve(v); if (!/#t=/.test(v.getAttribute('src'))) v.src = v.getAttribute('src') + '#t=0.1'; v.preload = 'metadata'; }), { rootMargin: '300px 0px' });
  $$('video[data-lazy-video]').forEach(v => vo.observe(v));
  document.addEventListener('play', e => $$('video').forEach(v => { if (v !== e.target) v.pause(); }), true);

  /* Award tilt */
  if (fine) $$('[data-tilt]').forEach(el => {
    const im = el.querySelector('img');
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; im.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`; });
    el.addEventListener('pointerleave', () => { im.style.transform = ''; });
  });

  /* Count-up */
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count;
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return; o.disconnect();
      const t0 = performance.now();
      const step = t => { const k = Math.min(1, (t - t0) / 1600); el.textContent = Math.round(to * (1 - (1 - k) ** 3)); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }).observe(el);
  });

  /* Forms */
  $$('form[data-lead]').forEach(f => f.addEventListener('submit', async e => {
    e.preventDefault();
    if (!f.reportValidity()) return;
    const status = $('.form-status', f), data = Object.fromEntries(new FormData(f));
    if (data._gotcha) return;
    const thanks = f.dataset.thanks;
    if (FORM_ENDPOINT) {
      status.textContent = 'Sending…';
      try { const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(f) }); if (!r.ok) throw 0; location.href = thanks; }
      catch { status.textContent = 'Sorry, something went wrong. Please call 855-878-1212.'; }
      return;
    }
    const lines = Object.entries(data).filter(([k, v]) => v && !k.startsWith('_')).map(([k, v]) => `${k}: ${v}`);
    location.href = `mailto:${SHOP_EMAIL}?subject=${encodeURIComponent('Website enquiry from ' + (data.Name || 'a visitor'))}&body=${encodeURIComponent(lines.join('\n'))}`;
    status.textContent = 'Opening your e-mail app… or call 855-878-1212.';
    setTimeout(() => { location.href = thanks; }, 1800);
  }));
})();
