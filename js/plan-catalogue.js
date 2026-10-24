/* ============================================
   AEAN STUDIOS: PLAN BUILDER SERVICE CATALOGUE
   One list of everything the plan builder can recommend. Both the AI
   (netlify/functions/plan.mjs) and the built-in fallback guide read it,
   and every price shown in a plan is worked out from here, never by the AI.

   To change a price, edit "from" and "to" (whole pounds).
   from: null  shows "priced after a quick chat"
   to:   null  shows "from £X"
   unit: "project" (one-off), "month", "each", "shoot"
   ============================================ */

export const CATALOGUE = {
  updated: '2026-10-24',
  groups: [
    { id: 'web', name: 'Websites' },
    { id: 'social', name: 'Social media' },
    { id: 'brand', name: 'Brand' },
    { id: 'print', name: 'Print and email' },
    { id: 'authors', name: 'For authors' },
    { id: 'creators', name: 'For YouTubers and creators' },
    { id: 'photo', name: 'Photography' }
  ],
  services: [
    // ---------- Websites
    { id: 'website-one-page', group: 'web', name: 'One-page website', unit: 'project', from: 200, to: null,
      what: 'A single page that explains what you do, who it is for and how to get in touch, designed and built for you and set up for Google.' },
    { id: 'website-multi-page', group: 'web', name: 'Multi-page website', unit: 'project', from: null, to: null,
      what: 'A home page plus separate pages for each service, area or product, so each one can be found on Google.' },
    { id: 'website-shop', group: 'web', name: 'Online shop', unit: 'project', from: null, to: null, addon: true,
      what: 'A shop section with a basket and secure checkout through Stripe, added to your website.' },
    { id: 'website-booking', group: 'web', name: 'Online booking', unit: 'project', from: null, to: null, addon: true,
      what: 'Appointment booking built into your website, with optional payment when people book.' },
    { id: 'website-interactive', group: 'web', name: 'Interactive feature', unit: 'project', from: null, to: null, addon: true,
      what: 'A quote calculator, quiz, game or other tool that gets visitors involved and helps them decide.' },
    { id: 'google-business-profile', group: 'web', name: 'Google Business Profile setup', unit: 'project', from: null, to: null,
      what: 'Your free Google listing set up or tidied up, with the right categories, photos and opening hours, so you show on Google Maps and in local searches.' },

    // ---------- Social media
    { id: 'social-management', group: 'social', name: 'Social media management', unit: 'month', from: 120, to: null, social: true,
      what: 'Planning, designing and posting for you each month, priced by how often you post.' },
    { id: 'social-content-creation', group: 'social', name: 'Content creation with filming days', unit: 'month', from: 300, to: 1000, social: true,
      what: 'Filmed and photographed content of your business, edited, captioned and scheduled, with strategy and community management.' },
    { id: 'social-template-kit', group: 'social', name: 'Canva template kit', unit: 'project', from: null, to: null,
      what: 'Templates designed around your brand so you can make your own posts each week and they still look like you.' },
    { id: 'script-writing', group: 'social', name: 'Video script writing', unit: 'each', from: 30, to: 30, addon: true,
      what: 'Ideas and scripts for short videos, written in your voice.' },

    // ---------- Brand
    { id: 'logo', group: 'brand', name: 'Logo design', unit: 'project', from: 50, to: 200,
      what: 'A logo designed for your business, priced by how many ideas and rounds of changes you need.' },
    { id: 'brand-identity', group: 'brand', name: 'Brand identity', unit: 'project', from: 100, to: 500,
      what: 'Your logo with the colours, fonts and simple guidelines around it, so everything you put out looks like it comes from the same place.' },
    { id: 'brand-colours-type', group: 'brand', name: 'Colour and typography refresh', unit: 'project', from: null, to: null,
      what: 'A chosen colour palette and font pairing for a business that already has a logo it likes.' },

    // ---------- Print and email
    { id: 'business-cards', group: 'print', name: 'Business card design', unit: 'project', from: null, to: null,
      what: 'Business cards designed and set up for print, with an NFC tap option that opens your website or contact details.' },
    { id: 'flyer', group: 'print', name: 'Flyer or poster design', unit: 'each', from: null, to: null,
      what: 'A flyer or poster designed and set up for print or for sharing online.' },
    { id: 'menu-design', group: 'print', name: 'Menu design', unit: 'project', from: null, to: null,
      what: 'A food or drinks menu laid out so it is easy to read and nudges people towards your best dishes, for print and online.' },
    { id: 'email-setup', group: 'print', name: 'Email newsletter setup', unit: 'project', from: null, to: null,
      what: 'A mailing list, sign-up form on your website and a branded email template, with a short welcome sequence for new subscribers.' },
    { id: 'newsletter-management', group: 'print', name: 'Newsletter management', unit: 'month', from: 100, to: 400,
      what: 'Copywriting, design and scheduled sends, so your newsletter goes out regularly without you writing it.' },
    { id: 'direct-mail', group: 'print', name: 'Direct mail campaign', unit: 'project', from: null, to: null,
      what: 'Printed mail sent to the people you want to reach, such as schools, venues or local customers, designed, written and planned for you.' },

    // ---------- Authors
    { id: 'cover-ebook', group: 'authors', name: 'Ebook cover', unit: 'each', from: 100, to: null,
      what: 'Front cover art and typography for Kindle and other ebook stores.' },
    { id: 'cover-paperback', group: 'authors', name: 'Paperback cover wrap', unit: 'each', from: null, to: null, addon: true,
      what: 'The full wrap, front, spine and back, set up to your printer\'s exact template.' },
    { id: 'cover-hardback', group: 'authors', name: 'Hardback cover wrap', unit: 'each', from: null, to: null, addon: true,
      what: 'A case-laminate or dust-jacket wrap set up to your printer\'s template.' },
    { id: 'author-promo', group: 'authors', name: 'Book launch graphics', unit: 'project', from: null, to: null,
      what: 'Announcement posts, 3D mockups and a banner set to launch the book across your socials and website.' },

    // ---------- Creators
    { id: 'thumbnail', group: 'creators', name: 'YouTube thumbnail', unit: 'each', from: 50, to: null,
      what: 'A custom thumbnail designed to be read in a second on a phone screen.' },
    { id: 'thumbnail-bundle', group: 'creators', name: 'Thumbnail bundle', unit: 'project', from: null, to: null,
      what: 'A set of thumbnails at a reduced rate per thumbnail, with a consistent style across your uploads.' },
    { id: 'channel-branding', group: 'creators', name: 'Channel banner and profile picture', unit: 'project', from: null, to: null,
      what: 'A channel banner and profile picture that match your thumbnails, so your channel looks like one brand.' },

    // ---------- Photography
    { id: 'photo-half-day', group: 'photo', name: 'Half-day photo shoot', unit: 'shoot', from: 250, to: 300,
      what: 'Photos of your space, products, food or team around Wigan, with edited images delivered.' },
    { id: 'photo-full-day', group: 'photo', name: 'Full-day photo shoot', unit: 'shoot', from: 500, to: 550,
      what: 'A bigger shoot, more than one location or a year\'s worth of photos for your website and socials.' }
  ]
};

export const PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'YouTube', 'Pinterest', 'Google Business Profile'];

export const byId = Object.fromEntries(CATALOGUE.services.map(s => [s.id, s]));
