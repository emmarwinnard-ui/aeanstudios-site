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
- `_redirects`: Netlify redirects

## Forms
Netlify Forms are detected from the HTML at deploy time (`newsletter` and `founders-table-interest`).
