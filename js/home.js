document.addEventListener('DOMContentLoaded', () => {
  // Hero sequence: the construction logo is the welcome on the home page,
  // with the tagline and CTA following it in.
  const logo = document.querySelector('.hero-aean-logo');
  const tagline = document.querySelector('.hero-logo-tagline');
  const heroFoot = document.querySelector('.hero-foot');

  setTimeout(() => {
    customElements.whenDefined('aean-logo').then(() => { if (logo) logo.play(); });
    setTimeout(() => tagline && tagline.classList.add('is-visible'), 2900);
    setTimeout(() => heroFoot && heroFoot.classList.add('is-visible'), 3800);
  }, 350);
});
