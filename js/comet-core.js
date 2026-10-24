/* ============================================
   THE COMET CORE — starfield & falling comets
   Lightweight canvas, pauses off-screen, respects
   prefers-reduced-motion.
   ============================================ */
(() => {
  const canvas = document.getElementById('cc-sky');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, dpr;
  let stars = [];
  let comets = [];
  let running = true;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedStars();
  }

  function seedStars() {
    const count = Math.floor((w * h) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 + 0.2,
      tw: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.015 + 0.005
    }));
  }

  function spawnComet() {
    const fromTop = Math.random() < 0.5;
    const startX = Math.random() * w * 1.2 - w * 0.1;
    const angle = (Math.random() * 18 + 28) * (Math.PI / 180); // 28-46deg
    const speed = Math.random() * 2.2 + 1.6;
    comets.push({
      x: startX,
      y: fromTop ? -40 : Math.random() * h * 0.3 - 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: Math.random() * 90 + 60,
      width: Math.random() * 1.6 + 1,
      life: 0,
      maxLife: Math.random() * 200 + 160,
      hue: Math.random() < 0.5 ? '139,125,232' : '182,169,255'
    });
  }

  let lastSpawn = 0;
  function maybeSpawn(t) {
    if (t - lastSpawn > (reduceMotion ? 999999 : (Math.random() * 1800 + 1400))) {
      lastSpawn = t;
      if (comets.length < 6) spawnComet();
    }
  }

  function draw(t) {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    // stars
    stars.forEach(s => {
      s.tw += s.speed;
      const a = 0.45 + Math.sin(s.tw) * 0.4;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(237,234,244,${Math.max(0, a)})`;
      ctx.fill();
    });

    if (!reduceMotion) {
      maybeSpawn(t);
      comets.forEach(c => {
        c.x += c.vx;
        c.y += c.vy;
        c.life++;

        const tailX = c.x - c.vx * (c.len / Math.max(c.vx, 0.6));
        const tailY = c.y - c.vy * (c.len / Math.max(c.vx, 0.6));
        const grad = ctx.createLinearGradient(c.x, c.y, tailX, tailY);
        const fade = c.life < 20 ? c.life / 20 : (c.life > c.maxLife - 30 ? Math.max(0, (c.maxLife - c.life) / 30) : 1);
        grad.addColorStop(0, `rgba(${c.hue},${0.95 * fade})`);
        grad.addColorStop(0.4, `rgba(${c.hue},${0.35 * fade})`);
        grad.addColorStop(1, `rgba(${c.hue},0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = c.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.width * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(237,234,244,${0.9 * fade})`;
        ctx.fill();
      });
      comets = comets.filter(c => c.life < c.maxLife && c.x < w + 150 && c.y < h + 150);
    }

    requestAnimationFrame(draw);
  }

  const io = new IntersectionObserver(entries => {
    running = entries[0].isIntersecting;
    if (running) requestAnimationFrame(draw);
  }, { threshold: 0 });

  window.addEventListener('resize', resize, { passive: true });
  resize();
  io.observe(canvas);
  requestAnimationFrame(draw);
})();
