/* ============================================
   AEAN STUDIOS: PLAN BUILDER (plan.html)
   Sends the description and contact details to /api/plan, which builds the
   plan (AI, or the built-in guide) and emails it. If the function can't be
   reached, the guide runs here in the browser instead. Prices always come
   from plan-catalogue.js.
   ============================================ */
import { byId, PHASES, priceText, totals, cadenceText, gbp, planAsText } from './plan-catalogue.js';
import { buildPlanFromRules } from './plan-rules.js';

const MAILERLITE_NEWSLETTER = 'https://assets.mailerlite.com/jsonp/2733678/forms/202140388220208941/subscribe';

const form = document.querySelector('.plan-form');
const text = document.getElementById('plan-text');
const count = document.querySelector('.plan-count');
const errorBox = document.querySelector('.plan-error');
const loading = document.querySelector('.plan-loading');
const result = document.querySelector('.plan-result');

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;

text.addEventListener('input', () => { count.textContent = text.value.length; });

function answers() {
  const fd = new FormData(form);
  return { type: fd.get('type') || '', have: fd.getAll('have'), start: fd.get('start') || '', monthly: fd.get('monthly') || '', goal: fd.get('goal') || '' };
}

function joinNewsletter(email, name) {
  const params = new URLSearchParams({ 'fields[email]': email, 'fields[name]': name, 'ml-submit': '1', anticsrf: 'true' });
  return fetch(MAILERLITE_NEWSLETTER, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() }).catch(() => {});
}

function recordLead(data) {
  // a copy in Netlify Forms ("plan-request"), so no lead is lost even if email isn't set up
  return fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ 'form-name': 'plan-request', ...data }).toString() }).catch(() => {});
}

function render(plan, { name, email, emailed }) {
  const t = totals(plan);
  const phaseHtml = plan.phases.map(p => `
    <section class="menu-course">
      <h3 class="menu-course-title"><span>${PHASES[p.key]}</span></h3>
      ${p.items.map(it => {
        const s = byId[it.id];
        const chips = [
          ...(it.platforms || []).map(x => `<span class="menu-chip">${esc(x)}</span>`),
          cadenceText(it.cadence) ? `<span class="menu-chip menu-chip--cadence">${esc(cadenceText(it.cadence))}</span>` : ''
        ].join('');
        return `<article class="menu-item">
          <div class="menu-item-head"><h4>${esc(s.name)}${it.quantity > 1 && s.unit !== 'month' ? ` <small>× ${it.quantity}</small>` : ''}</h4><span class="menu-leader" aria-hidden="true"></span><p class="menu-price">${esc(priceText(s, it.quantity))}</p></div>
          <p class="menu-details">${esc(it.details)}</p>
          ${chips ? `<div class="menu-chips">${chips}</div>` : ''}
          <p class="menu-why">${esc(it.why)}</p>
        </article>`;
      }).join('')}
    </section>`).join('');

  const notNeeded = plan.notNeeded?.length ? `<section class="menu-aside"><h3>Not needed yet</h3><ul>${plan.notNeeded.map(n => `<li><b>${esc(n.label)}.</b> ${esc(n.reason)}</li>`).join('')}</ul></section>` : '';
  const questions = plan.questions?.length ? `<section class="menu-aside"><h3>Things I'd ask you</h3><ul>${plan.questions.map(q => `<li>${esc(q)}</li>`).join('')}</ul></section>` : '';
  const source = plan.source === 'ai'
    ? 'Put together by AI from my services and prices. I go through every plan with you before anything is agreed, so treat it as a starting point.'
    : "Put together by the quick guide, because the AI planner isn't available right now. I've got a copy, and I'm happy to tailor it to you myself.";
  const first = esc(name.split(/\s+/)[0]);
  const notice = emailed
    ? `<p class="plan-notice">Thanks, ${first}. I've emailed a copy of your plan to <b>${esc(email)}</b>, so you have it to come back to. If it isn't there in a few minutes, have a look in your junk folder.</p>`
    : `<p class="plan-notice">Thanks, ${first}. Here's your plan. I couldn't email it to you just now, so save it as a PDF using the button below, and I've had a copy so I can follow up.</p>`;

  result.innerHTML = `
    ${notice}
    <div class="menu-card" id="your-plan" tabindex="-1">
      <header class="menu-head">
        <img src="assets/logos/lion_mark_only.png" alt="" class="menu-mark" width="64" height="29">
        <p class="menu-eyebrow">Made to order</p>
        <h2>Your plan</h2>
        <p class="menu-summary">${esc(plan.summary)}</p>
        ${plan.audience ? `<p class="menu-audience">${esc(plan.audience)}</p>` : ''}
      </header>
      ${phaseHtml}
      <footer class="menu-total">
        <div><span>One-off work</span><b>from ${gbp(t.oneOff)}</b></div>
        <div><span>Ongoing each month</span><b>${t.monthly ? `from ${gbp(t.monthly)}` : 'nothing yet'}</b></div>
        ${t.chat ? `<p class="menu-chat">Plus ${t.chat} ${t.chat === 1 ? 'item' : 'items'} priced after a quick chat, because it depends on the details.</p>` : ''}
        <p class="menu-fine">These are starting prices from my price list. Your quote depends on the details, and I'll always confirm it before any work starts.</p>
      </footer>
      ${notNeeded}${questions}
      <p class="menu-source">${source}</p>
    </div>

    <div class="plan-send">
      <h3 class="serif-italic">Like the look of it?</h3>
      <p>Reply to the email whenever you're ready, or start a project and I'll come back to you within a day with any questions and an exact quote. There's no obligation either way.</p>
      <div class="plan-send-actions">
        <a href="contact.html#brief" class="btn btn-bronze">Start a project
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg></a>
        <button type="button" class="text-link plan-print">Save as PDF</button>
        <button type="button" class="text-link plan-again">Build another plan</button>
      </div>
    </div>`;

  result.hidden = false;
  document.getElementById('your-plan').focus({ preventScroll: true });
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  result.querySelector('.plan-print').addEventListener('click', () => window.print());
  result.querySelector('.plan-again').addEventListener('click', () => {
    result.hidden = true; form.hidden = false; form.querySelector('.plan-go').disabled = false;
    form.scrollIntoView({ behavior: 'smooth' }); text.focus();
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.textContent = '';
  const business = text.value.trim();
  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const newsletter = form.elements.newsletter.checked;
  if (business.length < 20) { errorBox.textContent = 'Tell me a little more about your business first, even a couple of sentences helps.'; text.focus(); return; }
  if (!name) { errorBox.textContent = 'Please add your first name, so I know who the plan is for.'; form.elements.name.focus(); return; }
  if (!EMAIL_RE.test(email)) { errorBox.textContent = 'Please add a valid email address, so I can send you your plan.'; form.elements.email.focus(); return; }
  if (form.elements.website.value) return;

  const ans = answers();
  form.hidden = true; loading.hidden = false; result.hidden = true;
  loading.scrollIntoView({ behavior: 'smooth', block: 'center' });

  let plan = null, emailed = false;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 40000);
    const r = await fetch('/api/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: business, answers: ans, name, email, newsletter }), signal: ctrl.signal });
    clearTimeout(timer);
    if (r.status === 429) {
      loading.hidden = true; form.hidden = false;
      errorBox.textContent = "You've built a few plans in a short time, so please try again in an hour, or email me at hello@aeanstudios.com.";
      return;
    }
    if (r.ok) { const d = await r.json(); plan = d.plan; emailed = !!d.emailed; }
  } catch { /* fall back below */ }
  if (!plan || !plan.phases?.length) plan = buildPlanFromRules(business, ans);

  if (newsletter) joinNewsletter(email, name);
  recordLead({ name, email, newsletter: newsletter ? 'yes' : 'no', emailed: emailed ? 'yes' : 'no', business, answers: JSON.stringify(ans), plan: planAsText(plan), source: plan.source });

  loading.hidden = true;
  render(plan, { name, email, emailed });
  window.gtag?.('event', 'generate_lead', { method: 'plan_builder', source: plan.source });
});
