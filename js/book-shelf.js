/* ============================================
   AEAN STUDIOS — 3D BOOKSHELF (book-covers.html)
   Each .bs-slot carries its own data: title, author, image paths,
   proportions. Without JavaScript the books stay ordinary links.
   ============================================ */
(() => {
  const slots = [...document.querySelectorAll('.bs-slot')];
  const viewer = document.querySelector('.bs-viewer');
  if (!slots.length || !viewer) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const picks = slots.map(s => s.querySelector('.bs-pick'));
  const holder = viewer.querySelector('.bs-holder');
  const stage = viewer.querySelector('.bs-stage');
  const turn = viewer.querySelector('.bs-turn');
  const hint = viewer.querySelector('.bs-hint');
  const SHELF_ANGLE = 18;
  let cur = -1, vbook = null, angle = 0, lastFocus = null;

  /* ---------- books turn gently towards the cursor ---------- */
  let raf = 0, px = innerWidth / 2, py = innerHeight / 2;
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', e => {
      px = e.clientX; py = e.clientY;
      if (!raf && cur < 0) raf = requestAnimationFrame(tilt);
    }, { passive: true });
  }
  function tilt() {
    raf = 0;
    picks.forEach(p => {
      const r = p.getBoundingClientRect(), book = p.firstElementChild;
      const dx = (px - (r.left + r.width / 2)) / innerWidth;
      const dy = (py - (r.top + r.height / 2)) / innerHeight;
      book.style.setProperty('--ry', (SHELF_ANGLE + dx * 22).toFixed(2) + 'deg');
      book.style.setProperty('--rx', (-dy * 5).toFixed(2) + 'deg');
    });
  }

  /* ---------- building the large book ---------- */
  function face(cls, el = 'span') { const f = document.createElement(el); f.className = 'bs-face ' + cls; return f; }
  function buildBook(d) {
    const book = document.createElement('div'); book.className = 'bs-book';
    const front = face('bs-front', 'img'); front.src = d.front; front.alt = ''; front.decoding = 'async';
    const sheen = document.createElement('span'); sheen.className = 'bs-sheen';
    const spine = face('bs-spine'), back = face('bs-back');
    if (d.spine) { spine.style.backgroundImage = `url(${d.spine})`; back.style.backgroundImage = `url(${d.back})`; }
    else { spine.style.background = d.plain; back.style.background = d.plain; }
    book.append(front, sheen, spine, back, face('bs-fore'), face('bs-top'), face('bs-bottom'));
    return book;
  }
  const isWrap = i => !!slots[i].dataset.spine;

  function setAngle(a, instant) {
    angle = a; if (!vbook) return;
    vbook.classList.toggle('is-dragging', !!instant);
    vbook.style.transform = `rotateY(${a}deg)`;
    const norm = ((Math.round(a) % 360) + 360) % 360;
    turn.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.a === norm)));
  }
  function fill(i) {
    const s = slots[i], d = s.dataset; cur = i;
    holder.style.setProperty('--r', d.ratio);
    holder.style.setProperty('--dp', d.depth);
    holder.replaceChildren(vbook = buildBook(d));
    viewer.querySelector('.bs-vtitle').textContent = d.title;
    viewer.querySelector('.bs-vby').textContent = 'by ' + d.author;
    viewer.querySelector(".bs-vmeta").textContent = d.meta;
    const links = viewer.querySelector('.bs-vlinks');
    links.replaceChildren(s.querySelector('template.bs-links').content.cloneNode(true));
    turn.hidden = !isWrap(i);
    hint.textContent = isWrap(i) ? 'Drag the book to turn it, or use the buttons.' : 'Front cover only. Drag to tilt it.';
    // warm the cache for the neighbours
    [i - 1, i + 1].forEach(n => { const o = slots[(n + slots.length) % slots.length].dataset;
      [o.front, o.spine, o.back].filter(Boolean).forEach(src => { const im = new Image(); im.src = src; }); });
  }

  function open(i) {
    lastFocus = document.activeElement;
    fill(i);
    viewer.hidden = false;
    document.documentElement.classList.add('bs-locked');
    const from = picks[i].getBoundingClientRect();
    picks[i].style.visibility = 'hidden';
    requestAnimationFrame(() => {
      viewer.classList.add('is-open');
      const to = holder.getBoundingClientRect();
      if (!reduce) {
        const s = from.height / to.height;
        const dx = (from.left + from.width / 2) - (to.left + to.width / 2);
        const dy = (from.top + from.height / 2) - (to.top + to.height / 2);
        holder.animate([
          { transform: `translate(${dx}px, ${dy}px) scale(${s})` },
          { transform: 'translate(0, -3%) scale(1.02)', offset: .55 },
          { transform: 'none' }
        ], { duration: 950, easing: 'cubic-bezier(.22,.61,.36,1)' });
        setAngle(SHELF_ANGLE, true);
        requestAnimationFrame(() => requestAnimationFrame(() => setAngle(0)));
      } else setAngle(0);
      viewer.querySelector('.bs-close').focus({ preventScroll: true });
    });
  }
  function close() {
    if (cur < 0) return;
    const i = cur;
    const done = () => {
      viewer.hidden = true;
      document.documentElement.classList.remove('bs-locked');
      picks.forEach(p => p.style.visibility = '');
      cur = -1;
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    };
    viewer.classList.remove('is-open');
    if (reduce) return done();
    const to = picks[i].getBoundingClientRect(), from = holder.getBoundingClientRect();
    const s = to.height / from.height;
    const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
    setAngle(SHELF_ANGLE);
    holder.animate([{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(${s})` }],
      { duration: 600, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' })
      .finished.then(() => { holder.getAnimations().forEach(a => a.cancel()); done(); });
  }
  function step(dir) {
    const n = (cur + dir + slots.length) % slots.length;
    picks.forEach(p => p.style.visibility = '');
    picks[n].style.visibility = 'hidden';
    picks[n].scrollIntoView({ block: 'nearest', inline: 'center' });
    fill(n);
    setAngle(dir > 0 ? -35 : 35, true);
    requestAnimationFrame(() => requestAnimationFrame(() => setAngle(0)));
  }

  /* ---------- wiring ---------- */
  picks.forEach((p, i) => p.addEventListener('click', e => { e.preventDefault(); open(i); }));
  viewer.querySelector('.bs-close').addEventListener('click', close);
  viewer.querySelector('.bs-prev').addEventListener('click', () => step(-1));
  viewer.querySelector('.bs-next').addEventListener('click', () => step(1));
  viewer.addEventListener('click', e => { if (e.target === viewer) close(); });
  turn.addEventListener('click', e => {
    const a = e.target.dataset && e.target.dataset.a; if (a == null) return;
    let d = +a - (((angle % 360) + 360) % 360);
    if (d > 180) d -= 360; if (d < -180) d += 360;
    setAngle(angle + d);
  });
  addEventListener('keydown', e => {
    if (cur < 0) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Tab') {
      const f = [...viewer.querySelectorAll('button, a')].filter(x => x.offsetParent);
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* drag to turn */
  let dragX = null, startA = 0;
  stage.addEventListener('pointerdown', e => { dragX = e.clientX; startA = angle; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', e => {
    if (dragX == null) return;
    let a = startA + (e.clientX - dragX) * 0.45;
    if (!isWrap(cur)) a = Math.max(-35, Math.min(35, a));
    setAngle(a, true);
  });
  const endDrag = () => {
    if (dragX == null) return; dragX = null;
    if (!isWrap(cur)) setAngle(0); else vbook.classList.remove('is-dragging');
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
})();
