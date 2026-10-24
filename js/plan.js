/* ============================================
   AEAN STUDIOS: PLAN BUILDER (plan.html)
   Sends the description to /api/plan (the AI). If that isn't available,
   the built-in guide in plan-rules.js builds the plan instead. Prices
   always come from plan-catalogue.js.
   ============================================ */
import { CATALOGUE, byId } from './plan-catalogue.js';
import { buildPlanFromRules } from './plan-rules.js';

const form = document.querySelector('.plan-form');
const text = document.getElementById('plan-text');
const count = document.querySelector('.plan-count');
const errorBox = document.querySelector('.plan-error');
const loading = document.querySelector('.plan-loading');
const result = document.querySelector('.plan-result');

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const gbp = (n) => '£' + Number(n).toLocaleString('en-GB');
const PHASES = { first: 'Start here', next: 'Next', later: "When you're ready" };
const ONE_OFF = new Set(['project', 'each', 'shoot']);

text.addEventListener('input', () => { count.textContent = text.value.length; });

function answers() {
  const fd = new FormData(form);
  return { type: fd.get('type') || '', have: fd.getAll('have'), start: fd.get('start') || '', monthly: fd.get('monthly') || '', goal: fd.get('goal') || '' };
}

export function priceText(s, qty = 1) {
  if (s.from == null) return 'Priced after a quick chat';
  const per = s.unit === 'month' ? ' a month' : '';
  const q = ONE_OFF.has(s.unit) && s.unit !== 'project' && qty > 1 ? qty : 1;
  const lo = s.from * q, hi = s.to == null ? null : s.to * q;
  const forN = q > 1 ? ` for ${q}` : '';
  if (hi == null) return `from ${gbp(lo)}${per}${forN}`;
  if (hi === lo) return `${gbp(lo)}${per}${forN}`;
  return `${gbp(lo)} to ${gbp(hi)}${per}${forN}`;
}

export function totals(plan) {
  let oneOff = 0, monthly = 0, chat = 0;
  for (const p of plan.phases) for (const it of p.items) {
    const s = byId[it.id];
    if (s.from == null) { chat++; continue; }
    const q = s.unit !== 'project' && s.unit !== 'month' ? it.quantity || 1 : 1;
    if (s.unit === 'month') monthly += s.from; else oneOff += s.from * q;
  }
  return { oneOff, monthly, chat };
}

function cadenceText(c) {
  if (!c) return '';
  const bits = [];
  if (c.static) bits.push(`${c.static} ${c.static === 1 ? 'post' : 'posts'}`);
  if (c.video) bits.push(`${c.video} short ${c.video === 1 ? 'video' : 'videos'}`);
  if (c.stories) bits.push(`${c.stories} ${c.stories === 1 ? 'story' : 'stories'}`);
  if (!bits.length) return '';
  return bits.length > 1 ? `${bits.slice(0, -1).join(', ')} and ${bits.at(-1)} a week` : `${bits[0]} a week`;
}

function planAsText(plan) {
  const lines = [plan.summary, ''];
  for (const p of plan.phases) {
    lines.push(PHASES[p.key].toUpperCase());
    for (const it of p.items) {
      const s = byId[it.id];
      lines.push(`- ${s.name} (${priceText(s, it.quantity)}): ${it.details}`);
      if (it.platforms?.length) lines.push(`  Platforms: ${it.platforms.join(', ')}`);
      if (it.cadence) lines.push(`  ${cadenceText(it.cadence)}`);
    }
    lines.push('');
  }
  const t = totals(plan);
  lines.push(`One-off from ${gbp(t.oneOff)}, monthly from ${gbp(t.monthly)}${t.chat ? `, plus ${t.chat} priced after a chat` : ''}.`);
  if (plan.notNeeded.length) lines.push('', 'Not needed yet: ' + plan.notNeeded.map(n => n.label).join(', '));
  lines.push('', `Built by: ${plan.source === 'ai' ? 'AI planner' : 'built-in guide'}`);
  return lines.join('\n');
}

function render(plan, business, ans) {
  const t = totals(plan);
  const phaseHtml = plan.phases.map(p => `
    <section class="menu-course">
      <h3 class="menu-course-title"><span>${PHASES[p.key]}</span></h3>
      ${p.items.map(it => {
        const s = byId[it.id];
        const chips = [
          ...(it.platforms || []).map(x => `<span class="menu-chip">${esc(x)}</span>`),
          it.cadence && cadenceText(it.cadence) ? `<span class="menu-chip menu-chip--cadence">${esc(cadenceText(it.cadence))}</span>` : ''
        ].join('');
        return `<article class="menu-item">
          <div class="menu-item-head"><h4>${esc(s.name)}${it.quantity > 1 && s.unit !== 'month' ? ` <small>× ${it.quantity}</small>` : ''}</h4><span class="menu-leader" aria-hidden="true"></span><p class="menu-price">${esc(priceText(s, it.quantity))}</p></div>
          <p class="menu-details">${esc(it.details)}</p>
          ${chips ? `<div class="menu-chips">${chips}</div>` : ''}
          <p class="menu-why">${esc(it.why)}</p>
        </article>`;
      }).join('')}
    </section>`).join('');

  const notNeeded = plan.notNeeded.length ? `<section class="menu-aside"><h3>Not needed yet</h3><ul>${plan.notNeeded.map(n => `<li><b>${esc(n.label)}.</b> ${esc(n.reason)}</li>`).join('')}</ul></section>` : '';
  const questions = plan.questions.length ? `<section class="menu-aside"><h3>Things I'd ask you</h3><ul>${plan.questions.map(q => `<li>${esc(q)}</li>`).join('')}</ul></section>` : '';
  const source = plan.source === 'ai'
    ? 'Put together by AI from my services and prices. I go through every plan with you before anything is agreed, so treat it as a starting point.'
    : "Put together by the quick guide, because the AI planner isn't available right now. Send it over and I'll tailor it to you myself.";

  result.innerHTML = `
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
      <p>Send the plan to me and I'll reply within a day with any questions and an exact quote. There's no obligation, and I'll only use your details to reply.</p>
      <form class="plan-send-form" novalidate>
        <div class="plan-send-row">
          <label>Your name<input name="name" required autocomplete="name"></label>
          <label>Your email<input type="email" name="email" required autocomplete="email"></label>
        </div>
        <label>Anything to add? <span>(optional)</span><textarea name="note" rows="3"></textarea></label>
        <div class="plan-send-actions">
          <button type="submit" class="btn btn-bronze">Send my plan to Emma</button>
          <button type="button" class="text-link plan-print">Save as PDF</button>
          <button type="button" class="text-link plan-again">Start again</button>
        </div>
        <p class="plan-send-msg" aria-live="polite"></p>
      </form>
    </div>`;

  result.hidden = false;
  document.getElementById('your-plan').focus({ preventScroll: true });
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });

  result.querySelector('.plan-print').addEventListener('click', () => window.print());
  result.querySelector('.plan-again').addEventListener('click', () => {
    result.hidden = true; form.hidden = false; form.scrollIntoView({ behavior: 'smooth' }); text.focus();
  });
  const sendForm = result.querySelector('.plan-send-form');
  sendForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = sendForm.querySelector('.plan-send-msg');
    const name = sendForm.name.value.trim(), email = sendForm.email.value.trim();
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) { msg.textContent = 'Please add your name and a valid email address.'; return; }
    const btn = sendForm.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Sending…';
    const body = new URLSearchParams({
      'form-name': 'plan-request', name, email, note: sendForm.note.value.trim(), business,
      answers: JSON.stringify(ans), plan: planAsText(plan), source: plan.source
    });
    try {
      const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      if (!r.ok) throw new Error(r.status);
      sendForm.innerHTML = `<p class="plan-sent"><b>Thank you, ${esc(name.split(' ')[0])}.</b> Your plan is with me, and I'll reply to ${esc(email)} within a day. If you don't see it, have a look in your junk folder.</p>`;
      window.gtag?.('event', 'generate_lead', { method: 'plan_builder' });
    } catch {
      btn.disabled = false; btn.textContent = 'Send my plan to Emma';
      msg.innerHTML = 'That didn\'t send, sorry. Please try again, or email the plan to <a href="mailto:hello@aeanstudios.com">hello@aeanstudios.com</a>.';
    }
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.textContent = '';
  const business = text.value.trim();
  if (business.length < 20) { errorBox.textContent = 'Tell me a little more about your business first, even a couple of sentences helps.'; text.focus(); return; }
  if (form.website.value) return;
  const ans = answers();
  form.hidden = true; loading.hidden = false; result.hidden = true;
  loading.scrollIntoView({ behavior: 'smooth', block: 'center' });

  let plan = null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 35000);
    const r = await fetch('/api/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: business, answers: ans }), signal: ctrl.signal });
    clearTimeout(timer);
    if (r.ok) plan = (await r.json()).plan;
  } catch { /* fall back below */ }
  if (!plan || !plan.phases?.length) plan = buildPlanFromRules(business, ans);

  loading.hidden = true;
  render(plan, business, ans);
  window.gtag?.('event', 'plan_built', { source: plan.source });
});

// handy for testing in the console
window.__plan = { CATALOGUE, buildPlanFromRules, priceText, totals };
