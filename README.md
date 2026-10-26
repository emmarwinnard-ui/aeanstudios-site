# aeanstudios.com

The AEAN Studios website. Static HTML, CSS and JavaScript (GSAP for animation), hosted on Netlify.

## How deploys work
Netlify is connected to this repository. Every push to `main` deploys the live site automatically, and every earlier version stays in the history if something needs rolling back.

## Where things live
- `index.html` and the other top-level `.html` files: site pages
- `projects/`: case study pages
- `notes/`: Studio Notes articles
- `founders-table/`: The Founders' Table event page (registrations go to MailerLite and Netlify Forms)
- `js/newsletter.js`: newsletter sign-up form and popup (sends to MailerLite, backup copy to Netlify Forms)
- `css/tokens.css`: brand colours, type and spacing
- `assets/`: images, logos and video; `assets/email/` holds images used in emails
- `_redirects`: Netlify redirects (also hides this README and netlify.toml from the public site)
- `assets/og/`: 1200 x 630 share images used in each page's Open Graph tags
- `privacy.html` and `ai.html`: privacy policy and design and AI statement, linked from every footer

## Shared blocks
The menu, footer, newsletter strip and newsletter popup are repeated in every page rather than included, so a change to any of them has to be made in every `.html` file (the founders-table and card pages have their own designs and are the exceptions).

## Forms
Netlify Forms are detected from the HTML at deploy time (`newsletter` and `founders-table-interest`).

## Plan builder
`plan.html` lets visitors describe their business and get a tailored plan.
- Services, descriptions and prices: `js/plan-catalogue.js` (the only place prices live; `from: null` shows "priced after a quick chat").
- The AI: `netlify/functions/plan.mjs`, served at `/api/plan`. It needs an `ANTHROPIC_API_KEY` environment variable in Netlify. `PLAN_MODEL` optionally changes the model.
- Without the key, or if the AI fails, `js/plan-rules.js` builds the plan instead, so the page always works.
- Visitors give their first name and email to get the plan. `RESEND_API_KEY` lets the function email them the plan and send a copy to hello@ (templates in `netlify/lib/plan-email.mjs`). `PLAN_FROM` and `PLAN_NOTIFY` optionally change the sender and the copy address.
- Every plan is also saved as a Netlify form submission under `plan-request`, so no lead is lost if email isn't set up.
