# SETUP — everything you need to fill in

Every placeholder in the codebase is listed here. They are all marked in source with
`TODO(setup)`, so `grep -rn "TODO(setup)" src/ functions/` finds them at any time.

Ordered by what blocks launch soonest.

---

## 1. Blocks the ads going live

### Prices

Every figure on the two landing pages is a placeholder. Replace them and delete the
`TODO(setup)` comment above each.

| Where | File | Currently |
|---|---|---|
| Hero "from" price | `src/pages/ecommerce-development.astro` | 4,500 SAR |
| Pricing tiers ×3 | `src/pages/ecommerce-development.astro` | 4,500 / 9,500 / 18,000 |
| Hero "from" price | `src/pages/web-design-riyadh.astro` | 3,500 SAR |
| Pricing tiers ×3 | `src/pages/web-design-riyadh.astro` | 3,500 / 8,500 / 8,500+750 |
| Same four, Arabic | `src/pages/ar/تصميم-متجر-الكتروني.astro`, `src/pages/ar/تصميم-مواقع-الرياض.astro` | mirrored |
| Budget bands in the form | `src/i18n/forms.ts` | under 5,000 → over 25,000 |

Also confirm the VAT line is right: it currently says prices exclude 15% VAT and payment is
half up front, half on handover.

### Commercial registration number

Shown in the trust bar on all four landing pages as `CR 0000000000` /
`سجل تجاري 0000000000`. Search for `TODO(setup)` in the four landing page files.

### GTM container ID

`src/lib/analytics.ts` → `GTM_ID`. Currently `GTM-XXXXXXX`.

**Nothing analytics-related loads until this is replaced** — `ANALYTICS_ENABLED` checks for
the placeholder, so a stub ID cannot ship a broken container request to every visitor.
Consent defaults still fire regardless, which is what Google requires.

### Turnstile site key

`src/lib/analytics.ts` → `TURNSTILE_SITE_KEY`. Currently Cloudflare's public test key, which
always passes. Get a real pair from the Cloudflare dashboard: the site key goes here, the
secret goes in the Function environment (below).

---

## 2. Blocks the lead form actually delivering

These are environment variables on the Cloudflare Pages project, not files in the repo. See
`.env.example` for the full list.

| Variable | What it is |
|---|---|
| `LEAD_EMAIL_KEY` | Resend API key, or leave unset to fall back to MailChannels |
| `LEAD_EMAIL_TO` | Where leads are sent. Currently assumed `hello@powersourcedigital.com` |
| `LEAD_EMAIL_FROM` | A verified sending address on your domain |
| `TURNSTILE_SECRET_KEY` | The secret half of the Turnstile pair |

Also needed, created in the Cloudflare dashboard and bound to the Pages project:

- **KV namespace** bound as `LEADS_KV` — every lead is written here as a fallback, so a mail
  outage never loses an enquiry.

Confirm: is `hello@powersourcedigital.com` the right destination, and is the domain already
set up for sending (SPF and DKIM)? A "from" address on an unverified domain will be
delivered to spam or rejected outright.

---

## 3. Blocks the case study sections looking real

Nine placeholder slots, three on each landing page, marked with dashed borders and the word
TODO so nobody mistakes them for live content.

For each: client type, one headline metric, a before figure, an after figure, and **written
permission to publish it**. If a metric cannot be sourced, say so and the slot describes the
work instead — an invented number is worse than an honest description.

Files: the four landing pages, `cases.items`.

---

## 4. Blocks the trust strip

`src/data/clients.ts` → `CLIENTS` is deliberately empty.

Add a logo to `src/assets/clients/`, import it, and push `{ name, logo }`. The strip switches
from platform names to client logos automatically as soon as the array is non-empty.

The landing pages have their own logo row, currently reading "Client logos — to be supplied".

---

## 5. Not blocking, but worth doing

- **A PSD wordmark.** The site currently uses the PST mark. It works, but a digital agency
  sharing a panel-builder's logo is a weaker signal than it could be.
- **Google Business Profile URL**, for `sameAs` in the Organization schema.
- **Real reviews.** `AggregateRating` and `Review` are deliberately absent from
  `src/lib/schema.ts`. They go in when there are genuine reviews to cite — fabricating them
  risks a Google manual action.
- **Legal sign-off** on privacy policy and terms text, so `/privacy/` and `/terms/` can ship.

---

## How to find them all

```bash
grep -rn "TODO(setup)" src/ functions/
```

Every placeholder carries that marker. When the last one is gone, the grep returns nothing
and the site has no invented content anywhere in it.
