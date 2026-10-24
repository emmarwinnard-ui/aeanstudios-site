/* ============================================
   AEAN STUDIOS — PROJECT BRIEF BUILDER (contact.html#brief)
   Sends through Netlify Forms ("project-brief"). If that fails,
   it falls back to opening an email with the brief filled in.
   ============================================ */

/* ---------- PACKAGES: edit prices and descriptions here ----------
   Based on the AEAN Studios services sheet. Every figure is an estimate:
   low/high are the usual range in pounds (high: null means "from" pricing). per = what the price is for
   ('month', 'script' etc., leave out for one-off projects). addon: true
   shows the item as an extra rather than matching it against the budget.
   A service with an empty list tells the visitor it's priced individually. */
const PACKAGES = {
  website: {
    unit: 'project', label: 'Website design',
    note: 'The price covers design and code only. Your domain name, hosting and any paid tools are separate, and extra pages or features such as bookings, galleries or interactive tools are quoted on top.',
    items: [
      { name: 'Website Design', low: 200, high: null,
        desc: 'A simple single-page website, designed and built for you.' }
    ]
  },
  brand: {
    unit: 'project', label: 'Brand identity & logo',
    note: 'Price depends on scope.',
    items: [
      { name: 'Logo Design', low: 50, high: 200,
        desc: 'Custom logo and mark design for businesses that need a memorable visual starting point.' },
      { name: 'Brand Identity', low: 100, high: 500,
        desc: 'Logo, colour palette, typography and brand guidelines for a complete and consistent visual identity.' }
    ]
  },
  photo: {
    unit: 'project', label: 'Photography',
    note: 'Price depends on scope, locations and the number of final images.',
    items: [
      { name: 'Photography, Half-Day', low: 250, high: 300,
        desc: 'On-site photography for products, spaces, menu items or social content. Edited final images delivered.' },
      { name: 'Photography, Full-Day', low: 500, high: 550,
        desc: 'For larger shoots, multiple locations or a broader content library.' }
    ]
  },
  social: {
    unit: 'month', label: 'Social media & content',
    note: 'Price depends on platform count and content volume.',
    items: [
      { name: 'Social Media Management', low: 120, high: null, per: 'month',
        desc: 'Posting-only support with captions, scheduling and regular publishing across agreed platforms.' },
      { name: 'Content Creation', low: 300, high: 1000, per: 'month',
        desc: 'A fuller service covering strategy, filming, editing, captions, scheduling and posting.' },
      { name: 'Script Writing', low: 30, high: 30, per: 'script', addon: true,
        desc: 'Ideas and scripts written to suit your brand voice and filming style.' }
    ]
  },
  newsletter: {
    unit: 'month', label: 'Newsletter management',
    note: 'Price depends on how often you send and how much copy is involved.',
    items: [
      { name: 'Newsletter Management', low: 100, high: 400, per: 'month',
        desc: 'Copywriting, design and scheduled sends for a consistent newsletter presence.' }
    ]
  },
  cover: {
    unit: 'project', label: 'Book cover design',
    note: 'Price depends on the number of revisions, complexity and turnaround time.',
    items: [
      { name: 'Book Cover Design', low: 100, high: null,
        desc: 'Cover art and typography for independent authors, designed around the story inside.' }
    ]
  },
  illustration: { unit: 'project', label: 'Illustration',       items: [] },
  thumbs: {
    unit: 'project', label: 'YouTube thumbnails',
    note: 'Price depends on the number of revisions, complexity and turnaround time.',
    items: [
      { name: 'YouTube Thumbnail', low: 50, high: null,
        desc: 'Custom thumbnails designed to stand out in the feed and suit your channel.' }
    ]
  },
  other:        { unit: 'project', label: 'Something else',     items: [] }
};
const ESTIMATE_NOTE = 'All prices are estimates, and every project is quoted properly once we have spoken.';

(() => {
  const root = document.getElementById('brief');
  if (!root) return;
  const form = root.querySelector('.pb-form');
  const steps = [...form.querySelectorAll('.pb-step')];
  const progress = [...root.querySelectorAll('.pb-progress li')];
  const back = form.querySelector('.pb-back'), next = form.querySelector('.pb-next'), send = form.querySelector('.pb-send');
  const money = n => '£' + Number(n).toLocaleString('en-GB');
  let step = 0;

  const chosen = () => [...form.querySelectorAll('input[name="services"]:checked')];
  const keys = () => chosen().map(c => c.dataset.key);
  const sliderText = (input) => {
    const v = +input.value, max = +input.max, monthly = input.name === 'monthly_budget';
    return (v >= max ? money(v) + '+' : money(v)) + (monthly ? ' a month' : '');
  };

  /* ---------- budget step ---------- */
  const projSlider = form.querySelector('[data-budget="project"]');
  const monSlider = form.querySelector('[data-budget="monthly"]');
  const pkgBox = form.querySelector('.pb-packages');

  function paintSlider(wrap) {
    const input = wrap.querySelector('input'), out = wrap.querySelector('output');
    out.textContent = sliderText(input);
    const pct = (input.value - input.min) / (input.max - input.min) * 100;
    input.style.setProperty('--fill', pct + '%');
  }
  function renderPackages() {
    const ks = keys();
    projSlider.hidden = !ks.some(k => k !== 'social');
    monSlider.hidden = !ks.includes('social');
    [projSlider, monSlider].forEach(paintSlider);
    const parts = [];
    const quoted = [];
    ks.forEach(k => {
      const svc = PACKAGES[k]; if (!svc) return;
      if (!svc.items.length) { quoted.push(svc.label); return; }
      const budget = +(svc.unit === 'month' ? monSlider : projSlider).querySelector('input').value;
      const range = p => {
        const per = p.per ? (p.per === 'month' ? ' a month' : ' per ' + p.per) : '';
        if (p.high == null) return 'From ' + money(p.low) + per;
        return p.low === p.high ? 'Around ' + money(p.low) + per : 'Usually ' + money(p.low) + ' to ' + money(p.high) + per;
      };
      const main = svc.items.filter(p => !p.addon);
      const fits = main.filter(p => p.high != null && budget >= p.high);
      const maybe = main.filter(p => budget >= p.low && (p.high == null || budget < p.high));
      const above = main.filter(p => budget < p.low).sort((x, y) => x.low - y.low)[0];
      const addons = svc.items.filter(p => p.addon);
      const TAGS = { fits: 'Fits your budget', maybe: 'Possible, depending on scope', above: 'Just above your budget', addon: 'Optional extra' };
      const card = (p, tag) => `
        <article class="pb-pkg${tag === 'fits' || tag === 'maybe' ? ' is-fit' : ''}" data-tag="${tag}">
          <p class="pb-pkg-tag">${TAGS[tag]}</p>
          <h4>${p.name}</h4>
          <p class="pb-pkg-price">${range(p)}</p>
          <p class="pb-pkg-desc">${p.desc}</p>
        </article>`;
      parts.push(`<div class="pb-pkg-group"><p class="pb-pkg-svc">${svc.label}</p><div class="pb-pkg-row">
        ${fits.map(p => card(p, 'fits')).join('')}${maybe.map(p => card(p, 'maybe')).join('')}${above ? card(above, 'above') : ''}${addons.map(p => card(p, 'addon')).join('')}
      </div>${k === 'website' ? websiteScope() : ''}${svc.note ? `<p class="pb-pkg-note">${svc.note}</p>` : ''}</div>`);
    });
    if (quoted.length) parts.push(`<p class="pb-quoted">${quoted.join(', ')} ${quoted.length > 1 ? 'are' : 'is'} priced individually, so your budget goes into the brief and I'll come back with options that fit it.</p>`);
    if (parts.some(s => s.includes('pb-pkg-group'))) parts.push(`<p class="pb-estimate">${ESTIMATE_NOTE}</p>`);
    pkgBox.innerHTML = parts.join('');
  }
  [projSlider, monSlider].forEach(w => w.querySelector('input').addEventListener('input', renderPackages));

  /* ---------- website details ---------- */
  const webBox = form.querySelector('.pb-website');
  const webPages = () => (form.querySelector('input[name="website_pages"]:checked') || {}).value || '';
  const webFeatures = () => [...form.querySelectorAll('input[name="website_features"]:checked')].map(i => i.value);
  const syncWebsite = () => { webBox.hidden = !keys().includes('website'); };
  form.querySelectorAll('input[name="services"]').forEach(i => i.addEventListener('change', syncWebsite));
  syncWebsite();

  /* links such as contact.html?service=website#brief pre-select a service */
  const pre = new URLSearchParams(location.search).get('service');
  const preBox = pre && form.querySelector(`input[name="services"][data-key="${pre.replace(/[^a-z]/g, '')}"]`);
  if (preBox) { preBox.checked = true; syncWebsite(); }
  function websiteScope() {
    const pages = webPages(), feats = webFeatures();
    const bigger = (pages && pages !== 'One page' && pages !== 'Not sure yet') || feats.length;
    if (!pages && !feats.length) return '';
    const bits = [pages, feats.length ? feats.length + (feats.length === 1 ? ' feature' : ' features') : ''].filter(Boolean).join(' with ');
    return `<p class="pb-pkg-scope">You've asked for ${bits.toLowerCase()}${bigger ? ', so expect the quote to come in above the £200 starting point.' : '.'}</p>`;
  }

  /* ---------- review ---------- */
  const val = n => (form.elements[n] && form.elements[n].value || '').trim();
  function summary() {
    const ks = keys(), lines = [];
    lines.push(['Services', chosen().map(c => c.value).join(', ')]);
    if (!projSlider.hidden) lines.push(['Project budget', sliderText(projSlider.querySelector('input'))]);
    if (!monSlider.hidden) lines.push(['Monthly budget', sliderText(monSlider.querySelector('input'))]);
    const fitting = [...pkgBox.querySelectorAll('.pb-pkg.is-fit')].map(a => a.querySelector('h4').textContent + (a.dataset.tag === 'maybe' ? ' (depending on scope)' : ''));
    if (fitting.length) lines.push(['Packages in budget (estimated)', fitting.join(', ')]);
    if (keys().includes('website')) {
      if (webPages()) lines.push(['Website size', webPages()]);
      if (webFeatures().length) lines.push(['Website features', webFeatures().join(', ')]);
    }
    lines.push(['Timeline', (form.querySelector('input[name="timeline"]:checked') || {}).value || '']);
    if (val('deadline')) lines.push(['Fixed date', val('deadline')]);
    lines.push(['The business', val('business')]);
    if (val('audience')) lines.push(['Customers', val('audience')]);
    if (val('goal')) lines.push(['Success looks like', val('goal')]);
    if (val('links')) lines.push(['Links', val('links')]);
    form.elements.package_interest.value = fitting.join(', ');
    return lines;
  }
  function renderReview() {
    const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    root.querySelector('.pb-review').innerHTML = '<p class="pb-review-title">Your brief</p><dl>' +
      summary().map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('') + '</dl>';
  }

  /* ---------- validation ---------- */
  function check(i) {
    const err = steps[i].querySelector('.pb-error'); let msg = '';
    if (i === 0 && !chosen().length) msg = 'Pick at least one service to continue.';
    if (i === 2 && !form.querySelector('input[name="timeline"]:checked')) msg = 'Choose a rough start date.';
    if (i === 3 && !val('business')) msg = 'A line about the business is the one thing I need here.';
    if (i === 4) {
      if (!val('name')) msg = 'Please add your name.';
      else if (!form.elements.email.checkValidity() || !val('email')) msg = 'Please check your email address.';
    }
    if (err) err.textContent = msg;
    return !msg;
  }

  /* ---------- navigation ---------- */
  function go(i) {
    step = i;
    steps.forEach((s, n) => s.classList.toggle('is-active', n === i));
    progress.forEach((p, n) => { p.classList.toggle('is-current', n === i); p.classList.toggle('is-done', n < i); });
    back.hidden = i === 0;
    next.hidden = i === steps.length - 1;
    send.hidden = i !== steps.length - 1;
    if (i === 1) renderPackages();
    if (i === 4) renderReview();
    const legend = steps[i].querySelector('legend');
    legend.setAttribute('tabindex', '-1'); legend.focus({ preventScroll: true });
    const top = root.querySelector('.pb-progress').getBoundingClientRect().top;
    if (top < 0 || top > innerHeight * .6) root.querySelector('.pb-progress').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  next.addEventListener('click', () => { if (check(step)) go(step + 1); });
  back.addEventListener('click', () => go(step - 1));
  steps[4].addEventListener('input', renderReview);
  go(0);

  /* ---------- sending ---------- */
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!check(4)) return;
    const lines = summary();
    form.elements.summary.value = lines.map(([k, v]) => `${k}: ${v}`).join('\n');
    const data = new URLSearchParams();
    data.append('form-name', 'project-brief');
    data.append('bot-field', form.elements['bot-field'].value);
    data.append('name', val('name')); data.append('email', val('email'));
    data.append('services', chosen().map(c => c.value).join(', '));
    ['project_budget', 'monthly_budget'].forEach(n => {
      const w = n === 'project_budget' ? projSlider : monSlider;
      data.append(n, w.hidden ? '' : sliderText(w.querySelector('input')));
    });
    data.append('website_pages', keys().includes('website') ? webPages() : '');
    data.append('website_features', keys().includes('website') ? webFeatures().join(', ') : '');
    ['timeline'].forEach(n => data.append(n, (form.querySelector(`input[name="${n}"]:checked`) || {}).value || ''));
    ['deadline', 'business', 'audience', 'goal', 'links', 'package_interest', 'summary'].forEach(n => data.append(n, val(n)));
    send.disabled = true; send.textContent = 'Sending…';
    try {
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data.toString() });
      if (!res.ok) throw new Error(res.status);
      form.hidden = true; root.querySelector('.pb-progress').hidden = true;
      const done = root.querySelector('.pb-done'); done.hidden = false;
      done.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      // fall back to the visitor's email app with the brief already written
      const subject = encodeURIComponent(`Project brief from ${val('name')}`);
      const body = encodeURIComponent(form.elements.summary.value + `\n\n${val('name')}\nReply to: ${val('email')}`);
      window.location.href = `mailto:hello@aeanstudios.com?subject=${subject}&body=${body}`;
      send.disabled = false; send.textContent = 'Send the Brief';
      steps[4].querySelector('.pb-error').textContent = "That didn't go through, so your email app should now open with the brief written out. If it doesn't, email hello@aeanstudios.com.";
    }
  });
})();
