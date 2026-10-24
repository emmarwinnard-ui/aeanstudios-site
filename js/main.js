/* ============================================
   AEAN STUDIOS — SHARED BEHAVIOR
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Loading seal ---------- */
  const loader = document.querySelector('.seal-loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('is-hidden'), 500);
    });
    // fallback in case load already fired
    setTimeout(() => loader.classList.add('is-hidden'), 1800);
  }

  /* ---------- Nav scroll state ---------- */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Menu overlay ---------- */
  const burger = document.querySelector('.nav-burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (burger && mobileMenu) {
    const setMenu = (open) => {
      mobileMenu.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.documentElement.classList.toggle('menu-open', open);
    };
    burger.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('is-open')));
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    /* mark the current page in the menu */
    const here = location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/\/$/, '') || '/';
    mobileMenu.querySelectorAll('ul a').forEach(a => {
      const there = new URL(a.href, location.href).pathname.replace(/\.html$/, '').replace(/\/$/, '');
      if (there === here) a.classList.add('is-active');
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------- Scroll progress seal ---------- */
  const scrollSeal = document.querySelector('.scroll-seal');
  if (scrollSeal) {
    const progressCircle = scrollSeal.querySelector('.progress');
    const radius = 19;
    const circumference = 2 * Math.PI * radius;
    progressCircle.style.strokeDasharray = circumference;
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? scrolled / max : 0;
      progressCircle.style.strokeDashoffset = circumference * (1 - pct);
      scrollSeal.classList.toggle('is-visible', scrolled > 120);
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
  }

  /* ---------- Legacy "start a project" hooks: send to the brief ---------- */
  document.querySelectorAll('[data-open-contact], [data-instant-email]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const depth = (location.pathname.match(/\/(projects|notes)\//) ? '../' : '');
      location.href = depth + 'contact.html#brief';
    });
  });
});
