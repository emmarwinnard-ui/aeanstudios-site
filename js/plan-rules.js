/* ============================================
   AEAN STUDIOS: PLAN BUILDER, BUILT-IN GUIDE
   Used when the AI isn't available (no API key set, an error, or the
   hourly limit reached). It reads the same answers and keywords a
   person would, and builds a plan in the same shape the AI returns.
   ============================================ */

const has = (text, re) => re.test(text);

const KINDS = {
  food: /(?:caf[eé])(?![a-z])|\b(restaurant|coffee|bar|pub|bakery|baker|takeaway|bistro|deli|food|kitchen|catering|caterer|street food|tea ?room)\b/i,
  trades: /\b(builder|building|plumb|electric|roof|joiner|carpent|landscap|garden(er|ing)|decorat|plaster|clean(er|ing)|handyman|kitchen fitt|bathroom|extension|scaffold|mechanic|garage|removal)/i,
  wellness: /\b(salon|hair|barber|beauty|groom|dog|pet|kennel|cattery|nails?|lash|brow|massage|therap|physio|yoga|pilates|gym|personal train|fitness|clinic|aesthetic|spa|holistic|counsell)/i,
  products: /\b(shop|products?|etsy|handmade|candles?|jewel|clothing|boutique|prints|crafts?|sell online|ecommerce|e-commerce|stock)\b/i,
  author: /\b(author|novel|my book|books|writer|writing|publish|kindle|kdp|amazon|paperback|hardback|series|manuscript)\b/i,
  creator: /\b(youtube|youtuber|channel|gaming|twitch|streamer|podcast|subscribers|uploads?|videos? (each|every) week)\b/i,
  pro: /\b(consultan|accountan|solicitor|lawyer|coach|tutor|financial|mortgage|recruit|agency|b2b|freelanc|photographer|estate agent|architect)/i,
  venue: /\b(venue|wedding|events?|hotel|b&b|guest ?house|holiday let)\b/i
};

const KIND_LABEL = {
  food: 'a food and drink business', trades: 'a trade business', wellness: 'an appointment-based business, like beauty, wellness or pet care',
  products: 'a business selling products', author: 'an author', creator: 'a YouTuber or content creator',
  pro: 'a service business', venue: 'a venue or events business', local: 'a local business'
};

function detectKind(text, answers) {
  const t = answers.type;
  if (t === 'author') return 'author';
  if (t === 'creator') return 'creator';
  if (t === 'products') return 'products';
  const order = ['author', 'creator', 'food', 'venue', 'wellness', 'trades', 'products', 'pro'];
  for (const k of order) if (has(text, KINDS[k])) return k;
  return t === 'local' ? 'local' : 'local';
}

function detectHave(text, answers) {
  const ticked = (answers.have || []).length > 0;
  const h = new Set(answers.have || []);
  // if nothing was ticked, don't assume they lack a logo or listings unless they say so
  if (!ticked) { h.add('logo'); h.add('gbp-unknown'); }
  const no = (w) => new RegExp(`\\b(no|don'?t have|do not have|haven'?t got|without|need)\\b[^.!?]{0,30}\\b${w}`, 'i').test(text);
  if (no('website')) h.delete('website');
  else if (/\b(my|our) (website|site)\b|\bhave a (website|site)\b/i.test(text)) h.add('website');
  if (no('logo')) h.delete('logo');
  else if (/\b(my|our) logo\b|have a logo\b/i.test(text)) h.add('logo');
  if (/\b(instagram|facebook|tiktok|linkedin)\b/i.test(text) && !no('(social|instagram|facebook)')) h.add('social');
  if (/google (business|maps|listing)/i.test(text) && !no('google')) h.add('gbp');
  return h;
}

const BUDGET_RANK = { 'under-100': 0, '100-300': 1, '300-750': 2, '750-plus': 3, unsure: 1 };
const START_RANK = { 'under-250': 0, '250-750': 1, '750-2000': 2, '2000-plus': 3, unsure: 1 };

function platformsFor(kind, text) {
  const young = /\b(students?|teen|young|gen ?z|20s)\b/i.test(text);
  switch (kind) {
    case 'trades': return ['Facebook', 'Google Business Profile'];
    case 'food': return young ? ['Instagram', 'TikTok', 'Google Business Profile'] : ['Instagram', 'Facebook', 'Google Business Profile'];
    case 'wellness': return young ? ['Instagram', 'TikTok'] : ['Instagram', 'Facebook'];
    case 'products': return /\b(handmade|gift|wedding|home|interior|craft)/i.test(text) ? ['Instagram', 'Pinterest'] : ['Instagram', 'TikTok'];
    case 'pro': return ['LinkedIn', 'Facebook'];
    case 'venue': return ['Instagram', 'Facebook'];
    case 'author': return /\b(children|kids|middle.grade|picture book|schools?)\b/i.test(text) ? ['Facebook', 'Instagram'] : ['Instagram', 'TikTok'];
    default: return ['Facebook', 'Instagram'];
  }
}

function cadenceFor(rank) {
  if (rank >= 3) return { static: 4, video: 3, stories: 7 };
  if (rank === 2) return { static: 3, video: 2, stories: 5 };
  return { static: 3, video: 1, stories: 3 };
}

export function buildPlanFromRules(rawText, answers = {}) {
  const text = ` ${rawText || ''} `;
  const kind = detectKind(text, answers);
  const have = detectHave(text, answers);
  const monthly = BUDGET_RANK[answers.monthly] ?? 1;
  const start = START_RANK[answers.start] ?? 1;
  const goal = answers.goal || (/\bbook(ing)?s?\b/i.test(text) && kind !== 'author' ? 'bookings' : /\bsell|sales\b/i.test(text) ? 'sales' : 'enquiries');
  const bookingKind = kind === 'wellness' || kind === 'pro' || goal === 'bookings' || /\b(appointments?|book(ing)? (in|online)|lessons?)\b/i.test(text);

  const first = [], next = [], later = [], notNeeded = [], questions = [];
  const add = (list, id, details, why, extra = {}) => list.push({ id, quantity: extra.quantity || 1, details, why, ...extra });
  const plats = platformsFor(kind, text);

  if (kind === 'author') {
    const wantsPrint = /\b(paperback|print|physical|bookshops?|signings?)\b/i.test(text) || answers.type === 'author';
    const wantsHard = /\bhardback|hardcover\b/i.test(text);
    add(first, 'cover-ebook', 'Front cover designed for Kindle and the other ebook stores.', 'The cover is what makes a reader stop on your book in a list of thumbnails, so it comes first.');
    if (wantsPrint) add(first, 'cover-paperback', 'Full paperback wrap with spine and back cover, set up to your printer\'s template.', 'You mentioned print, and the wrap needs to be built to the exact page count before you can order copies.');
    if (wantsHard) add(next, 'cover-hardback', 'Hardback wrap set up to your printer\'s template.', 'You mentioned a hardback edition.');
    if (!have.has('website')) add(next, start >= 2 ? 'website-multi-page' : 'website-one-page', start >= 2 ? 'An author website with pages for each book, an about page and a sign-up form for readers.' : 'A single-page author site with your books, a short bio and where to buy.', 'Readers, bookshops and schools will look you up, and a site of your own is the one place you control.');
    add(next, 'author-promo', 'Launch posts, 3D book mockups and a banner set for your socials and website.', 'It gives you something polished to share in the weeks around launch day.');
    if (/\b(children|kids|schools?|middle.grade|picture book|teachers?)\b/i.test(text)) add(later, 'direct-mail', 'A printed mailing to local primary schools offering author visits, with a letter and an activity sheet.', 'Schools are one of the best routes to young readers, and a printed pack is harder to ignore than another email.');
    add(later, 'email-setup', 'A reader mailing list with a sign-up form on your site and a welcome email.', 'A list of readers is something you own, and it makes the next launch easier.');
    notNeeded.push({ label: 'Paid social media management', reason: 'For most authors, posting yourself around launch time is enough, so it\'s better to spend on the cover first.' });
    questions.push('Where are you publishing, for example Amazon KDP, IngramSpark or a small press?', 'Is the book finished, and do you know the final page count?');
  } else if (kind === 'creator') {
    if (monthly >= 1 || start >= 1) add(first, 'thumbnail-bundle', 'A set of thumbnails in one consistent style for your next uploads.', 'A recognisable style helps returning viewers spot your videos, and buying a set brings the price of each one down.');
    else add(first, 'thumbnail', 'One custom thumbnail for your next upload, to test the style.', 'It\'s the cheapest way to see what difference a stronger thumbnail makes to your clicks.');
    add(next, 'channel-branding', 'A channel banner and profile picture that match the thumbnails.', 'When someone clicks through to your channel, it should look like the same creator they just watched.');
    if (/\b(merch|store|shop|patreon|sponsor)/i.test(text)) add(later, 'website-one-page', 'A simple page for sponsors and merch, linking to your channel.', 'Sponsors look for a professional page they can send to their team.');
    notNeeded.push({ label: 'Social media management', reason: 'YouTube is your main platform, so start with the things people see before they click.' });
    questions.push('Roughly how many videos do you upload a month?', 'Do you have a few channels you admire the look of?');
  } else {
    // local businesses, products, services, venues
    if (!have.has('logo')) add(first, start >= 2 ? 'brand-identity' : 'logo', start >= 2 ? 'Logo, colours, fonts and a one-page guide so everything matches.' : 'A simple logo you can use on your sign, socials and website.', 'People judge whether a business is established in seconds, and a clear logo is the first thing they notice.');
    if (!have.has('website')) {
      const multi = start >= 2 || kind === 'trades' && start >= 1;
      add(first, multi ? 'website-multi-page' : 'website-one-page',
        multi ? 'A home page plus a page for each of your main services or areas, set up for Google.' : 'One page that says what you do, where you work and how to get in touch, set up for Google.',
        'Most people look a business up online before they call, and a website is the one place that\'s fully yours.');
      if (kind === 'products' || goal === 'sales') add(first, 'website-shop', 'A shop section with a basket and Stripe checkout for your products.', 'You want to sell, so people need to be able to buy without messaging you first.');
      else if (bookingKind) add(goal === 'bookings' || /\b(dms?|messages|chaos|phone calls|back and forth)\b/i.test(text) ? first : next, 'website-booking', 'Online booking with your services, prices and free times.', 'It lets people book when they think of it, often in the evening, without waiting for a reply.');
    } else if (goal === 'enquiries' || goal === 'bookings') {
      questions.push('Could you send me your current website, so I can see what\'s working and what isn\'t?');
    }
    if (!have.has('gbp') && kind !== 'products' && (!have.has('gbp-unknown') || kind === 'trades' || kind === 'food' || kind === 'wellness' || kind === 'venue')) add(have.has('website') ? first : next, 'google-business-profile', 'Your Google listing set up with categories, photos, opening hours and your website link.', 'It\'s free, and it\'s often what people see first when they search for a local business.');

    if (monthly >= 1) {
      const c = cadenceFor(monthly);
      const socialId = monthly >= 2 && (kind === 'food' || kind === 'venue' || kind === 'wellness') ? 'social-content-creation' : 'social-management';
      add(next, socialId, `${c.static} posts, ${c.video} short ${c.video === 1 ? 'video' : 'videos'} and ${c.stories} stories a week on ${plats.filter(p => p !== 'Google Business Profile').join(' and ')}.`,
        'Posting regularly keeps you in front of people between the times they need you, and it\'s handled for you.', { platforms: plats.filter(p => p !== 'Google Business Profile'), cadence: c });
    } else {
      add(next, 'social-template-kit', `Templates for ${plats.filter(p => p !== 'Google Business Profile').join(' and ')} you can fill in yourself each week.`, 'It keeps your posts looking professional while the budget is tight, and you can hand them over later.');
      notNeeded.push({ label: 'Monthly social media management', reason: 'With a small monthly budget, templates you fill in yourself will go further for now.' });
    }

    if (kind === 'food') {
      add(next, 'photo-half-day', 'A half-day shoot of your food, drinks, space and team.', 'Good photos of the food do more for a restaurant than any caption, and you\'ll use them everywhere.');
      add(later, 'menu-design', 'Your menu laid out for print and as a page on your website.', 'A clear menu helps people decide before they arrive, and it\'s one of the most viewed pages on a food website.');
    } else if (kind === 'venue') {
      add(next, 'photo-half-day', 'A half-day shoot of the venue set up as guests would see it.', 'People book venues on the photos, so this matters more than almost anything else.');
    } else if (kind === 'products') {
      add(next, 'photo-half-day', 'A half-day shoot of your products, with plain-background shots and styled ones.', 'Clear product photos are what make people trust a small shop enough to buy.');
    } else if (kind === 'trades') {
      add(later, 'business-cards', 'Business cards with an NFC tap that opens your website.', 'You meet customers in person, so a card that takes them straight to your reviews and work is useful.');
      add(later, 'flyer', 'A leaflet for the areas you want more work in.', 'Leaflets still work for local trades, especially in the streets around a job you\'re already doing.');
      notNeeded.push({ label: 'TikTok', reason: 'Your customers are far more likely to find you on Google and Facebook.' });
    } else if (kind === 'wellness') {
      add(later, 'email-setup', 'A mailing list and a simple monthly email with offers and free slots.', 'It brings existing clients back, which is usually cheaper than finding new ones.');
    } else if (kind === 'pro') {
      notNeeded.push({ label: 'Photo shoots and filming days', reason: 'For a service business, a clear website and a steady LinkedIn presence usually matter more to start with.' });
    }
    if (have.has('website') && have.has('logo') && have.has('social') && first.length === 0) {
      add(first, 'google-business-profile', 'A check and tidy of your Google listing, with photos and the right categories.', 'You already have the basics, so the quickest win is making sure people find you on Google.');
    }
    questions.push('Where do most of your customers come from at the moment?', 'How many new customers a month could you comfortably take on?');
  }

  // keep the first step affordable for small budgets
  if (start === 0 && first.length > 2) next.unshift(...first.splice(2));

  const goalText = { enquiries: 'more enquiries', bookings: 'more bookings', sales: 'more sales', professional: 'to look more professional', launch: 'a strong launch' }[goal] || 'more customers';
  const summary = `From what you've told me, you're ${KIND_LABEL[kind]} and you'd like ${goalText}. The plan starts with what should make the biggest difference first, and leaves the rest until you're ready, so you only pay for what you need right now.`;

  return {
    source: 'guide',
    summary,
    audience: '',
    phases: [
      { key: 'first', items: first },
      { key: 'next', items: next },
      { key: 'later', items: later }
    ].filter(p => p.items.length),
    notNeeded,
    questions: questions.slice(0, 3)
  };
}
