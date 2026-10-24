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

  /* ---------- Mobile menu ---------- */
  const burger = document.querySelector('.nav-burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      mobileMenu.classList.toggle('is-open');
      burger.classList.toggle('is-open');
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
    }));
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

  /* ---------- Quick-contact: step aside while scrolling ---------- */
  // On phones this button is fixed bottom-right, which means it can end up
  // sitting on top of whatever content happens to scroll into that corner
  // (e.g. a centred CTA button). Fading it out during active scrolling and
  // back in once the page settles keeps it out of the way without removing
  // the affordance.
  const quickContact = document.querySelector('.quick-contact');
  if (quickContact && window.matchMedia('(max-width: 640px)').matches) {
    let scrollTimer = null;
    const onQcScroll = () => {
      quickContact.classList.add('is-scrolling');
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        quickContact.classList.remove('is-scrolling');
      }, 400);
    };
    window.addEventListener('scroll', onQcScroll, { passive: true });
  }

  /* ---------- Contact modal (one-click enquiry) ---------- */
  const modal = document.querySelector('.contact-modal');
  const backdrop = document.querySelector('.contact-modal-backdrop');
  const openers = document.querySelectorAll('[data-open-contact]');
  const closer = document.querySelector('.contact-modal-close');

  function openModal(e) {
    if (e) e.preventDefault();
    modal?.classList.add('is-open');
    backdrop?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const label = e?.currentTarget?.dataset?.openContact;
    const messageField = form?.querySelector('[name="message"]');
    if (messageField) {
      messageField.value = label ? `I'd like to enquire about ${label.toLowerCase()}.` : '';
    }
  }
  function closeModal() {
    modal?.classList.remove('is-open');
    backdrop?.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  openers.forEach(btn => btn.addEventListener('click', openModal));
  closer?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  const form = document.querySelector('.contact-modal form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailField = form.querySelector('[name="email"]');
      const messageField = form.querySelector('[name="message"]');
      const nameField = form.querySelector('[name="name"]');
      const subject = encodeURIComponent(`New enquiry from ${nameField?.value || 'website'} for AEAN Studios`);
      const body = encodeURIComponent(
        `${messageField?.value || 'Wanting to get in touch.'}\n\n${nameField?.value || ''}\nReply to: ${emailField?.value || ''}`
      );
      window.location.href = `mailto:hello@aeanstudios.com?subject=${subject}&body=${body}`;
      modal?.classList.add('is-success');
      const successMsg = modal?.querySelector('.success-msg');
      successMsg?.classList.add('show');
    });
  }

  /* point people towards the full brief builder from the quick-message modal */
  if (modal && !document.getElementById('brief')) {
    const about = document.querySelector('a[href$="about.html"]');
    const briefHref = about ? about.getAttribute('href').replace('about.html', 'contact.html#brief') : 'contact.html#brief';
    const link = document.createElement('a');
    link.href = briefHref; link.className = 'text-link contact-modal-brief';
    link.textContent = 'Prefer to send a full brief? Build one in two minutes →';
    link.style.cssText = 'display:inline-block;margin-top:1.2rem;font-size:.85rem;color:var(--bronze-light)';
    modal.querySelector('form')?.after(link);
  }

  /* one-click "instant enquiry" buttons that skip the form entirely */
  document.querySelectorAll('[data-instant-email]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const subject = encodeURIComponent('New enquiry for AEAN Studios');
      const body = encodeURIComponent('Hi Emma,\n\nI would love to talk about a project.\n\nMy email: ');
      window.location.href = `mailto:hello@aeanstudios.com?subject=${subject}&body=${body}`;
    });
  });
});
