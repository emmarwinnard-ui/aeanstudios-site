/* ============================================
   AEAN STUDIOS: PLAN BUILDER EMAILS
   Builds the "your plan" email for the visitor and the lead email for Emma.
   ============================================ */
import { byId, PHASES, priceText, totals, cadenceText, gbp, planAsText } from '../../js/plan-catalogue.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SITE = 'https://aeanstudios.com';
const utm = (path, content) => `${SITE}${path}${path.includes('?') ? '&' : '?'}utm_source=plan_builder&utm_medium=email&utm_campaign=plan_builder&utm_content=${content}`;

const INK = '#0F1512', IVORY = '#E8E5DE', FERN = '#243329', SLATE = '#5C635D', BRASS = '#6E5D3F', BRASS_BTN = '#A18B64';
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export function visitorEmail(plan, name) {
  const first = esc(String(name || '').trim().split(/\s+/)[0] || 'there');
  const t = totals(plan);
  const phases = plan.phases.map(p => `
    <tr><td style="padding:28px 0 6px;font-family:${SANS};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${BRASS};border-bottom:1px solid #cfc8b8;">${esc(PHASES[p.key])}</td></tr>
    ${p.items.map(it => {
      const s = byId[it.id];
      const extra = [it.platforms && it.platforms.length ? it.platforms.join(', ') : '', cadenceText(it.cadence)].filter(Boolean).join(' \u00b7 ');
      return `<tr><td style="padding:18px 0;border-bottom:1px dotted #bdb6a6;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-family:${SERIF};font-size:19px;text-transform:uppercase;letter-spacing:0.5px;color:${INK};">${esc(s.name)}${it.quantity > 1 && s.unit !== 'month' ? ` <span style="font-size:14px;color:${SLATE};text-transform:none;">&times; ${it.quantity}</span>` : ''}</td>
          <td align="right" style="font-family:${SANS};font-size:14px;color:${INK};white-space:nowrap;padding-left:12px;">${esc(priceText(s, it.quantity))}</td>
        </tr></table>
        <p style="margin:8px 0 0;font-family:${SANS};font-size:15px;line-height:1.6;color:${FERN};">${esc(it.details)}</p>
        ${extra ? `<p style="margin:8px 0 0;font-family:${SANS};font-size:13px;color:${INK};"><span style="background:${FERN};color:${IVORY};padding:3px 8px;">${esc(extra)}</span></p>` : ''}
        <p style="margin:8px 0 0;font-family:${SERIF};font-style:italic;font-size:16px;line-height:1.5;color:${SLATE};">${esc(it.why)}</p>
      </td></tr>`;
    }).join('')}`).join('');

  const list = (title, items) => items.length ? `<tr><td style="padding:24px 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#dedad1;"><tr><td style="padding:18px 20px;">
      <p style="margin:0 0 8px;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${BRASS};">${title}</p>
      ${items.map(x => `<p style="margin:6px 0 0;font-family:${SANS};font-size:14px;line-height:1.6;color:${FERN};">${x}</p>`).join('')}
    </td></tr></table></td></tr>` : '';

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your plan from AEAN Studios</title></head>
<body style="margin:0;padding:0;background:${INK};">
<div style="display:none;max-height:0;overflow:hidden;">The plan you built on my website, with what to do first and starting prices.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK};"><tr><td align="center" style="padding:32px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
    <tr><td align="center" style="padding:0 0 24px;"><a href="${utm('/', 'logo')}"><img src="${SITE}/assets/logos/wordmark_only_ivory.png" width="170" alt="AEAN Studios" style="display:block;border:0;"></a></td></tr>
    <tr><td style="background:${IVORY};padding:40px 36px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-family:${SANS};font-size:16px;line-height:1.7;color:${FERN};">
          <p style="margin:0 0 14px;">Hi ${first},</p>
          <p style="margin:0 0 14px;">Here's the plan you built on my website, so you have it to come back to. It's a starting point based on what you told me, and I'm always happy to talk any of it through, so just reply to this email if you'd like to.</p>
        </td></tr>
        <tr><td align="center" style="padding:18px 0 4px;font-family:${SANS};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${BRASS};">Made to order</td></tr>
        <tr><td align="center" style="font-family:${SERIF};font-size:34px;text-transform:uppercase;letter-spacing:1px;color:${INK};padding-bottom:14px;">Your plan</td></tr>
        <tr><td style="font-family:${SANS};font-size:15px;line-height:1.7;color:${FERN};text-align:center;">${esc(plan.summary)}</td></tr>
        ${plan.audience ? `<tr><td style="padding-top:12px;font-family:${SERIF};font-style:italic;font-size:16px;line-height:1.5;color:${SLATE};text-align:center;">${esc(plan.audience)}</td></tr>` : ''}
        ${phases}
        <tr><td style="padding:24px 0 0;border-top:2px solid ${INK};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${FERN};padding:6px 0;">One-off work</td><td align="right" style="font-family:${SERIF};font-size:22px;color:${INK};">from ${gbp(t.oneOff)}</td></tr>
            <tr><td style="font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${FERN};padding:6px 0;">Ongoing each month</td><td align="right" style="font-family:${SERIF};font-size:22px;color:${INK};">${t.monthly ? 'from ' + gbp(t.monthly) : 'nothing yet'}</td></tr>
          </table>
          ${t.chat ? `<p style="margin:10px 0 0;font-family:${SANS};font-size:13px;color:${SLATE};">Plus ${t.chat} ${t.chat === 1 ? 'item' : 'items'} priced after a quick chat, because it depends on the details.</p>` : ''}
          <p style="margin:10px 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${SLATE};">These are starting prices from my price list. Your quote depends on the details, and I'll always confirm it before any work starts.</p>
        </td></tr>
        ${list('Not needed yet', (plan.notNeeded || []).map(n => `<b style="color:${INK};">${esc(n.label)}.</b> ${esc(n.reason)}`))}
        ${list("Things I'd ask you", (plan.questions || []).map(esc))}
        <tr><td align="center" style="padding:32px 0 6px;">
          <a href="${utm('/contact.html#brief', 'start_project')}" style="display:inline-block;background:${BRASS_BTN};color:${INK};font-family:${SANS};font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:15px 28px;">Start a project</a>
          <p style="margin:12px 0 0;font-family:${SANS};font-size:14px;color:${SLATE};">or just reply to this email</p>
        </td></tr>
        <tr><td style="padding-top:26px;font-family:${SANS};font-size:15px;line-height:1.7;color:${FERN};">Emma<br><span style="color:${SLATE};font-size:13px;">AEAN Studios, Wigan</span></td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:22px 12px;font-family:${SANS};font-size:12px;line-height:1.6;color:#B5B1A7;text-align:center;">
      You're getting this because you asked for your plan on <a href="${utm('/plan', 'footer')}" style="color:#C2AD83;">aeanstudios.com</a>. This is a one-off email, and I won't add you to any mailing list unless you asked to join the newsletter.<br>
      AEAN Studios &middot; <a href="mailto:hello@aeanstudios.com" style="color:#C2AD83;">hello@aeanstudios.com</a> &middot; <a href="${utm('/privacy', 'privacy')}" style="color:#C2AD83;">Privacy</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;

  const text = `Hi ${String(name || '').trim().split(/\s+/)[0] || 'there'},

Here's the plan you built on my website, so you have it to come back to. It's a starting point based on what you told me, and I'm always happy to talk any of it through, so just reply to this email if you'd like to.

YOUR PLAN

${planAsText(plan)}

Start a project: ${utm('/contact.html#brief', 'start_project_text')}

Emma
AEAN Studios, Wigan

You're getting this because you asked for your plan on aeanstudios.com. This is a one-off email, and I won't add you to any mailing list unless you asked to join the newsletter.`;

  return { subject: 'Your plan from AEAN Studios', html, text };
}

export function leadEmail(plan, { name, email, business, answers, newsletter, source }) {
  const first = plan.phases[0]?.items.map(i => byId[i.id]?.name).filter(Boolean).slice(0, 2).join(', ') || 'a plan';
  const ans = answers || {};
  const text = `New plan from the plan builder (${source === 'ai' ? 'AI' : 'built-in guide'}).

Name: ${name}
Email: ${email}
Joining the newsletter: ${newsletter ? 'yes (MailerLite will ask them to confirm)' : 'no'}

WHAT THEY WROTE
${business}

THEIR ANSWERS
Type: ${ans.type || 'not given'}
Already has: ${(ans.have || []).join(', ') || 'nothing ticked'}
Budget to start: ${ans.start || 'not given'}
Monthly budget: ${ans.monthly || 'not given'}
Goal: ${ans.goal || 'not given'}

THE PLAN THEY WERE SENT
${planAsText(plan)}

Reply to this email to answer them directly.`;
  return {
    subject: `New plan: ${name} (${first})`,
    text,
    html: `<pre style="font-family:Menlo,Consolas,monospace;font-size:13px;line-height:1.55;white-space:pre-wrap;">${esc(text)}</pre>`
  };
}
