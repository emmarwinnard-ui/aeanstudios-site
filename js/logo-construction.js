/* ============================================
   AEAN STUDIOS — LOGO CONSTRUCTION VIEW (logos.html)
   Each .lc-board holds a mark (alpha PNG) and its guide positions,
   taken from the original Affinity grid files. The button swaps the
   photo for the drawing-board view and draws the guides in.
   ============================================ */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.65,0,.35,1)';

  document.querySelectorAll('.lc-board').forEach(board => {
    const media = board.closest('.logo-feed-media');
    const btn = media.querySelector('.lc-toggle');
    const stage = board.querySelector('.lc-stage');
    const mark = board.querySelector('.lc-mark');
    const g = JSON.parse(board.dataset.guides);

    // guide lines live in a 0..1 box matching the mark, extended past its edges
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '-0.4 -0.4 1.8 1.8');
    svg.setAttribute('preserveAspectRatio', 'none');
    const lines = [];
    const add = (x1, y1, x2, y2) => {
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2);
      l.setAttribute('pathLength', '1'); l.style.strokeDasharray = '1'; l.style.strokeDashoffset = '1';
      svg.appendChild(l); lines.push(l);
    };
    g.h.forEach(y => add(-0.4, y, 1.4, y));
    g.v.forEach(x => add(x, -0.4, x, 1.4));
    stage.appendChild(svg);

    let anims = [];
    const play = () => {
      anims.forEach(a => a.cancel()); anims = [];
      const A = (el, kf, o) => { const a = el.animate(kf, Object.assign({ fill: 'both' }, o)); anims.push(a); };
      lines.forEach((l, i) => A(l, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 800, delay: 150 + i * 70, easing: EASE }));
      A(mark, [{ opacity: 0, filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 900, delay: 300 + lines.length * 70, easing: 'ease-out' });
      if (reduce) anims.forEach(a => a.finish());
    };
    const set = on => {
      media.classList.toggle('is-construction', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? 'See it in context' : 'See the construction';
      board.setAttribute('aria-hidden', String(!on));
      if (on) play();
    };
    btn.addEventListener('click', () => set(!media.classList.contains('is-construction')));
  });
})();
