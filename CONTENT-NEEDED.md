# Content and assets needed from Power Source Digital

Nothing on this list can be invented. Where an item is missing, the build leaves a marked
slot rather than a placeholder that looks real. No fabricated client names, testimonials,
review counts or ratings will ship.

Ordered by what blocks work soonest.

---

## RESOLVED

- **Logo** — confirmed 2026-09-06: PSD uses the PST mark. Colours sampled from the file and
  the palette is built. A PSD-specific wordmark is still worth commissioning, but nothing is
  blocked on it.
- **Typefaces** — Instrument Sans, IBM Plex Sans Arabic and Almarai, all open-licensed and
  self-hosted. No licence to buy.
- **Target cities** — confirmed: Riyadh, Jeddah, Taif, plus Mecca and Al Kharj as the
  surrounding areas. Say if a different "surrounding" set is wanted.

---

## Still blocking

### 1. The PST flyer PDF — still outstanding

Referenced in the brief as an attachment; never received. Not blocking the build, but it is
the best available source for the Arabic copy voice and the exact offer wording already in
use. Send it before the Arabic homepage copy is written.

### 2. A PSD wordmark — worth commissioning, not blocking

PSD is currently using PST's mark. That works, and the palette is built from it. But the two
companies sell different things, and a digital agency sharing a panel-builder's logo is a
weaker signal than it should be. Say if you want a PSD-specific wordmark scoped as separate
design work.

---

## Blocking the Work / case-study pages

### 3. Client work screenshots

Real screenshots of shipped sites, at desktop and mobile, for the hero device frames and the
case-study strip. The brief is explicit that these replace stock photography. Currently there
are none.

For each piece of work: client name, what was built, the URL if it is live, and permission to
show it publicly.

### 4. Case-study detail

For each of 3-5 projects: the brief, what was done, and a result that can be stated honestly.
"Traffic up 40%" needs a source; if no measurable result exists, the case study describes the
work and says nothing about numbers.

### 5. Trust-strip logos

Client or partner logos, with permission to display. Without these the logo marquee is cut,
not filled with invented brands.

---

## Blocking social proof

### 6. Testimonials

Real quotes with a real name, role and company. `AggregateRating` and `Review` schema will be
omitted entirely unless genuine reviews exist — fabricating them is both against the brief
and a Google structured-data policy violation.

### 7. Google Business Profile

Link to the live PSD profile, plus current review count and average rating if any. Needed for
`sameAs` and for honest local proof on city pages.

---

## Blocking About / Process

### 8. Team photo and team facts

Names, roles, and whether the team is happy to be shown. If not, the About page is built
around the work rather than faces.

### 9. PST relationship detail

The brief calls the PST connection "a genuine differentiator" for the industrial/electrical
industry page. To use it I need: what PSD has actually delivered for PST (the quotation
system? the catalogues? the VFD technical design?), and whether it can be named publicly.

PST address on file: RCSA2543 Asad Ibn Al Fourat, Al Amal, Riyadh 12364. Confirm this is the
address to publish, and whether PSD shares it or has its own.

---

## Blocking Pricing

### 10. Real prices

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

### 11. Privacy policy and terms

Both are linked in the live footer and both currently 404. The new site will have real pages
at `/privacy/` and `/terms/`. I can draft PDPL-aware text, but it needs a human sign-off
before publication — I am not able to give legal advice, and a privacy policy is a legal
document that has to describe what the business actually does with data.

Needed to draft: what data is collected, how long it is kept, who it is shared with (Resend,
Cloudflare, Google), and the contact point for data subject requests.
