# Content and assets needed from Power Source Digital

Nothing on this list can be invented. Where an item is missing, the build leaves a marked
slot rather than a placeholder that looks real. No fabricated client names, testimonials,
review counts or ratings will ship.

Ordered by what blocks work soonest.

---

## Blocking Checkpoint 1 (design tokens and type)

### 1. The Power Source Digital logo — **blocking**

The live site at `powersourcedigital.com` serves `/wp-content/uploads/2026/08/logo.jpg`,
which is **the PST logo** (green swoosh, red P, yellow S, blue T). Saved locally at
`brand-source/psd-live-logo.jpg`.

So one of these is true, and I need to know which:

- **(a) PSD has its own mark** that simply was never uploaded → send it, vector preferred
  (`.svg`, `.ai`, `.eps`; a 2000px+ PNG with transparency is workable).
- **(b) PSD has no mark yet** and is borrowing PST's → then the palette should be derived
  from PST while the wordmark is designed separately, and that design work needs to be
  scoped.
- **(c) PSD will use the PST mark permanently** → the site inherits a four-colour logo, and
  the palette has to be built to accommodate red and yellow rather than the "deep green and
  dark navy" the brief assumes.

The brief describes the parent brand as "a deep green and a dark navy/charcoal". The actual
PST mark is green, red, yellow and blue. That gap has to close before the palette is real.

### 2. The PST flyer PDF — **blocking**

Referenced in the brief as an attachment; never received. Needed for the existing Arabic
copy voice, the offer wording, and any typographic cues already in use.

### 3. Licensed display typefaces

The brief names Satoshi, General Sans or Instrument Sans for Latin. Satoshi and General Sans
are Fontshare (free for commercial use); Instrument Sans is SIL OFL. All three are
self-hostable without purchase. Confirm the pick, or say if a licence is already owned for
something else.

Arabic: IBM Plex Sans Arabic and Noto Kufi Arabic (both OFL) for headings, Almarai (OFL) for
body. No licence obstacle. Confirm the pairing.

---

## Blocking the Work / case-study pages

### 4. Client work screenshots

Real screenshots of shipped sites, at desktop and mobile, for the hero device frames and the
case-study strip. The brief is explicit that these replace stock photography. Currently there
are none.

For each piece of work: client name, what was built, the URL if it is live, and permission to
show it publicly.

### 5. Case-study detail

For each of 3-5 projects: the brief, what was done, and a result that can be stated honestly.
"Traffic up 40%" needs a source; if no measurable result exists, the case study describes the
work and says nothing about numbers.

### 6. Trust-strip logos

Client or partner logos, with permission to display. Without these the logo marquee is cut,
not filled with invented brands.

---

## Blocking social proof

### 7. Testimonials

Real quotes with a real name, role and company. `AggregateRating` and `Review` schema will be
omitted entirely unless genuine reviews exist — fabricating them is both against the brief
and a Google structured-data policy violation.

### 8. Google Business Profile

Link to the live PSD profile, plus current review count and average rating if any. Needed for
`sameAs` and for honest local proof on city pages.

---

## Blocking About / Process

### 9. Team photo and team facts

Names, roles, and whether the team is happy to be shown. If not, the About page is built
around the work rather than faces.

### 10. PST relationship detail

The brief calls the PST connection "a genuine differentiator" for the industrial/electrical
industry page. To use it I need: what PSD has actually delivered for PST (the quotation
system? the catalogues? the VFD technical design?), and whether it can be named publicly.

PST address on file: RCSA2543 Asad Ibn Al Fourat, Al Amal, Riyadh 12364. Confirm this is the
address to publish, and whether PSD shares it or has its own.

---

## Blocking Pricing

### 11. Real prices

The brief wants a price table on the pricing page and a real price table in the "how much a
website costs in Saudi Arabia" blog post. I will not invent numbers. Needed: actual package
prices or ranges in SAR, what each includes, and whether VAT is shown inclusive or exclusive.

---

## Blocking Forms and Analytics (step 5)

These are account-level and cannot be created from here:

| Item | Needed for |
|---|---|
| Cloudflare account access or an API token | Pages project, D1 database, KV namespace |
| Cloudflare Turnstile site key + secret | form spam protection |
| Resend API key + verified sending domain | lead notification and auto-reply email |
| GA4 measurement ID | analytics |
| Google Search Console verification token | indexation |
| Microsoft Clarity project ID | session recording |

Also confirm: is `hello@powersourcedigital.com` the address lead notifications go to, and is
its domain already set up for sending (SPF/DKIM)?

---

## Blocking DNS cutover (step 9)

- Confirm the domain registrar and who controls DNS today.
- Confirm Hostinger hosting can stay live during cutover for rollback.
- Confirm nothing else runs on the domain (mail, subdomains) that a nameserver change would
  disturb.

---

## Legal copy

### 12. Privacy policy and terms

Both are linked in the live footer and both currently 404. The new site will have real pages
at `/privacy/` and `/terms/`. I can draft PDPL-aware text, but it needs a human sign-off
before publication — I am not able to give legal advice, and a privacy policy is a legal
document that has to describe what the business actually does with data.

Needed to draft: what data is collected, how long it is kept, who it is shared with (Resend,
Cloudflare, Google), and the contact point for data subject requests.
