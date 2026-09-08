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

The endpoint at `/api/lead` is built and live. It validates, rejects bots, and answers in
the visitor's language — verified against production. What it cannot yet do is *keep* the
lead, because nothing is bound to store or send it.

Until at least one of KV or Resend is configured, a valid submission returns **500** and the
visitor is shown the WhatsApp fallback. That is deliberate: the endpoint never reports
success for a lead that reached neither storage nor an inbox.

### 2a. KV namespace — do this first (free, ~2 minutes)

This alone makes the form stop failing. Every lead is written here *before* the email is
attempted, so leads survive any mail problem.

1. **Storage & Databases → KV → Create a namespace**, name it `powersourcedigital-leads`.
2. **Workers & Pages → powersourcedigital → Settings → Bindings → Add → KV namespace**.
3. Variable name **must** be exactly `LEADS_KV`. Select the namespace. Save.
4. Redeploy (Deployments → Retry deployment) — bindings only attach on a new deployment.

Read leads back under **KV → your namespace → View**, keys sorted newest last as
`lead:<timestamp>:<id>`.

The same binding also backs the per-IP rate limit (5 submissions per 10 minutes). Without
it, there is no rate limiting at all.

### 2b. Email delivery

| Variable | What it is |
|---|---|
| `LEAD_EMAIL_KEY` | Resend API key. **There is no keyless fallback** — see below |
| `LEAD_EMAIL_TO` | Where leads are sent. Currently assumed `hello@powersourcedigital.com` |
| `LEAD_EMAIL_FROM` | An address on a domain **verified with Resend** |

Set these under **Settings → Variables and Secrets**, as *secrets* rather than plain text
for the API key. All three must be present or email is skipped entirely.

> An earlier version of this file said an unset key falls back to MailChannels. It does not.
> MailChannels withdrew free sending from Cloudflare Workers in June 2024.

Your MX is Titan (`mx1.titan.email`), which handles *incoming* mail and is unrelated to
sending from the site. You still need to verify the domain in Resend and add its DKIM
records. `LEAD_EMAIL_FROM` on an unverified domain is rejected or spam-foldered silently.

Confirm: is `hello@powersourcedigital.com` the right destination?

### 2c. Turnstile — currently proving nothing

`src/lib/analytics.ts` still holds Cloudflare's **public test site key**
(`1x00000000000000000000AA`). That is why the widget shows a red "For testing only. If seen,
report to site owner" strip, and it passes every request including bots.

1. **Turnstile → Add site**, domain `powersourcedigital.com`.
2. Put the **site key** in `TURNSTILE_SITE_KEY` in `src/lib/analytics.ts` (public, belongs in
   the repo).
3. Put the **secret key** in `TURNSTILE_SECRET_KEY` as a Cloudflare secret (never in the repo).

While `TURNSTILE_SECRET_KEY` is unset the endpoint **skips verification entirely** so the
form keeps working. Until you set it, the only spam defences are the honeypot and the rate
limit.

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

## 5. Build variables — the ones that must be set at BUILD time

This trips people up, so it is worth stating plainly: this is a **static site**.
Anything that appears in the HTML has to exist when the build runs. A value added as a
*runtime secret* is invisible to the build, the placeholder ships instead, and everything
looks configured while nothing changed.

That is exactly how the Turnstile test key survived being "set up".

Set these under **Workers & Pages → powersourcedigital → Settings → Variables and Secrets**,
as **plain text variables** (not secrets), then **redeploy**:

| Variable | What it is |
|---|---|
| `PUBLIC_TURNSTILE_SITE_KEY` | The **site** key from Turnstile → your site. Public by design |
| `PUBLIC_GTM_ID` | Your GTM container, e.g. `GTM-ABC1234` |

The matching `TURNSTILE_SECRET_KEY` stays a **secret**, because the Function reads it at
runtime. Site key public and at build time, secret key private and at runtime — they are
different halves and they go in different places.

The build prints a warning while the test key is still in use, so the deploy log will tell
you whether it took.

---

## 6. The daily publishing schedule

Twelve posts are written and dated forward, one per day. A post appears only once the site
is **rebuilt** on or after its date — nothing happens on its own.

`.github/workflows/publish-scheduled-posts.yml` rebuilds the site daily at 01:00 UTC
(04:00 Riyadh). It needs two things:

1. **Cloudflare → Workers & Pages → powersourcedigital → Settings → Builds & deployments →
   Deploy hooks → Add.** Name it `daily-publish`, branch `main`. Copy the URL.
2. **GitHub → the repo → Settings → Secrets and variables → Actions → New repository
   secret**, named `CLOUDFLARE_DEPLOY_HOOK`, holding that URL.

Until the secret exists the workflow fails loudly on its first run, which is deliberate —
the alternative is a workflow that reports success while publishing nothing.

To release a post early: **Actions → Publish scheduled posts → Run workflow**.

To change the schedule, edit `publishedAt` in the post's front matter. `pnpm run check`
enforces that no post links to one published after it, because such a link is dead until
the target's date and fails the build that morning.

---

## 7. Not blocking, but worth doing

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
