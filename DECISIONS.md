# Architectural decisions

Newest last. Each entry records what was chosen, and why — especially where the choice
departs from the original brief.

---

## 1. Static output, no Cloudflare adapter

**Brief asked for:** `@astrojs/cloudflare` adapter with `output: 'static'`.

**Chosen:** `output: 'static'`, no adapter.

Those two settings are mutually exclusive. `@astrojs/cloudflare` exists to run Astro's
server runtime on Cloudflare Workers; installing it with a fully prerendered site adds a
Worker entrypoint that never handles a request. A static Astro build deploys to Cloudflare
Pages directly, and `functions/` (Pages Functions) are deployed alongside the static assets
by Cloudflare itself — the adapter plays no part in that. The form endpoint at
`functions/api/lead.ts` therefore works with zero adapter.

If server islands are genuinely needed later (they are not needed for anything in the
current site map), the adapter gets added then, with `output: 'server'` and
`prerender = true` as the default — not before.

> **Superseded in part by decision 16.** The deployment target turned out to be a Worker,
> not Pages, so the `functions/` directory does not apply. The no-adapter conclusion stands.

## 2. `routes.ts` is the only place a URL is written

Every href, canonical, hreflang entry and sitemap URL is produced by `localizedPath()`.
Route *keys* (`serviceDetail`, `freeAudit`) are the internal names and never appear in a
URL, so renaming an Arabic slug is a one-line change with no site-wide search-and-replace.

`alternates()` returns the whole hreflang cluster — every locale plus `x-default` — from a
single call, which is what stops an EN page and its AR twin from drifting apart. There is
no code path that emits one side of a cluster without the other.

Arabic paths are authored in Arabic script in that file and percent-encoded only at output
time by `href()`, so the source stays readable and the encoding is applied in exactly one
place.

## 3. No Astro i18n `fallback`

`routing.prefixDefaultLocale` is `false` and no `fallback` key is configured. Configuring a
fallback would let an Arabic URL silently serve English content. Every Arabic page is
authored; a missing one should 404 during development and fail the route-parity check, not
quietly render the wrong language.

## 4. `t()` throws on a missing key

`src/i18n/ui.ts` derives its key union from the English dictionary and constrains Arabic
with `satisfies Record<UIKey, string>`, so a missing Arabic string is a type error. At
runtime `t()` throws rather than returning the key or falling back to English — a
half-Arabic page is a worse outcome than a failed build.

## 5. Western Arabic numerals on Arabic pages

`formatNumber()` uses the `ar-SA-u-nu-latn` locale extension. Plain `ar-SA` renders Eastern
Arabic numerals (٠١٢٣); Saudi business sites overwhelmingly use 0-9. Phone numbers get
`unicode-bidi: isolate; direction: ltr` via the `.num` class so they do not reorder inside
RTL text.

## 6. Biome does not lint `.astro`; `astro check` does

Biome 2.x parses only the frontmatter of an `.astro` file, not the template. That makes
`noUnusedVariables` and `noUnusedImports` fire on every variable that is used *in the
template* — pure false positives. `.astro` is excluded from Biome and type-checked by
`astro check`, which uses the Astro language server and understands both halves of the file.
Biome still owns `.ts`, `.mjs`, `.json` and `.css`.

`complexity/noImportantStyles` is disabled for `src/styles/global.css` only: the
`prefers-reduced-motion` reset must use `!important` to beat inline and component styles,
which is the entire point of that block.

## 7. Physical-direction utilities fail the build

`scripts/check-logical-props.mjs` scans `src/components`, `src/layouts` and `src/pages` for
`ml-`/`mr-`/`left:`/`border-l-` and friends, and exits non-zero on a hit. A single line can
opt out with a `dir-ok` comment for the rare genuinely-physical case. This is what keeps one
stylesheet correct in both writing directions instead of relying on review to catch it.

## 8. `@astrojs/sitemap` is a placeholder

Our EN and AR slugs are deliberately not mirrored (`/services/seo/` ↔
`/ar/الخدمات/تحسين-محركات-البحث/`), and `@astrojs/sitemap`'s `i18n` option can only express
mirrored paths. It is installed now for basic coverage; step 6 replaces it with a custom
sitemap endpoint driven by `routes.ts` so that sitemap alternates and on-page hreflang come
from one source.

## 9. Arabic services slug changed from the live site

Live is `/ar/خدماتنا/` ("our services"). New is `/ar/الخدمات/` ("the services"), per the
brief. The live site is one week old, so the redirect costs nothing and the new slug matches
real search behaviour. Full mapping in `docs/legacy-urls.md`.

## 10. `/portfolio/` → `/work/`

The brief's rule is that existing English URLs must not change, and it names
`/services/`, `/about/`, `/contact/`, `/free-audit/` — all four are preserved exactly. The
brief separately specifies `/work/` as the case-study index, while the live site uses
`/portfolio/`. `/work/` wins and `/portfolio/` 301s to it, for the same reason as decision 9:
a one-week-old URL with no equity to protect.

## 11. Four logo colours, four different jobs

The PST mark is green, red, yellow and blue — sampled from the logo file with sharp rather
than estimated by eye: `#00A858`, `#E83030`, `#F8C828`, `#2850A0`.

Four colours is too many for a UI palette; used decoratively they read as a children's
brand. Rather than discard two, each is given exactly one job:

- **green** — the brand accent. The one colour a visitor associates with PSD.
- **blue** — desaturated and darkened into the `ink` neutral ramp. Every grey on the site
  is quietly the logo's blue rather than a generic slate.
- **red** — `danger` only. Form errors. Never decorative.
- **yellow** — `warning` only. Audit "needs attention" states. Never decorative.

The site is therefore built from the mark without looking like the mark.

## 12. The accent is two steps darker than the logo green

`#00A858` reaches only **4.44:1** on white. It cannot legally carry body-size text or a
white button label under WCAG AA, and the brief requires Accessibility 100.

`--accent` is therefore `brand-700` (`#006E3C`, 6.37:1). The true logo green survives as
`--accent-vivid` for decorative use only — gradients, hairline card edges, icon fills on
dark grounds — where no text sits on it.

`scripts/check-contrast.mjs` reads the real token values out of `global.css`, resolves
`var()` chains, and asserts all 30 semantic pairs in both themes. It found this failure;
it was not caught by eye. It runs in `pnpm check`.

## 13. `border-subtle` is deliberately exempt from 3:1

WCAG 2.2 SC 1.4.11 governs boundaries that *identify a control*, not decorative hairlines.
Holding a card divider to 3:1 would force a heavy border and wreck the visual language for
no accessibility gain. The tokens are split: `--border-subtle` (decorative, untested) and
`--border-interactive` (input and control boundaries, asserted at 3:1).

## 14. Cities narrowed to the stated target market

The brief listed 8 cities. The actual target is Riyadh, Jeddah, Taif "and surrounding
areas", so the list is now those three plus Mecca (shares a metro with Jeddah and Taif) and
Al Kharj (Riyadh metro). Dammam, Al Khobar, Medina, Tabuk and Abha are removed — pages for
markets the business is not targeting would be thin content with no local proof behind them.

That takes generated city pages from 80 to **50** (5 services × 5 cities × 2 languages).

## 15. Fonts: Instrument Sans + IBM Plex Sans Arabic + Almarai

All three are open-licensed (SIL OFL) and self-hosted via Fontsource, so there is no licence
to buy. Satoshi and General Sans were the alternatives but are Fontshare-only and not on npm,
which would mean vendoring files by hand.

Arabic pairs two faces deliberately: IBM Plex Sans Arabic for headings (firmer structure at
display sizes) and Almarai for running text (better rhythm at body sizes). Arabic gets 1.06×
the Latin body size and 1.9 leading, and never receives the negative tracking applied to
Latin display type — Arabic is cursive and negative tracking breaks the letter joins.

Each Fontsource file carries a `unicode-range`, so an English page never downloads the
Arabic faces and vice versa. The subsetting is done by the loader, not by shipping every
glyph to everyone.

## 16. Workers Static Assets, not Pages — and what that costs

The Cloudflare project was created through **Workers Builds**, not Pages: its deploy command
is `npx wrangler deploy`. That is the right side of the fork to be on — Cloudflare has put
Pages into maintenance and points new static projects at Workers static assets — but it is a
different deployment model, so the choice is recorded rather than absorbed silently.

`wrangler.jsonc` declares an **assets-only Worker**: no `main` script, so every request is
served from `./dist` by the runtime. `_headers` and `_redirects` are supported here exactly
as they were on Pages, and both land in `dist/` from `public/`.

**What this invalidates from decision 1:** the `functions/` directory is a *Pages* convention
and does nothing on a Worker. The lead endpoint cannot be `functions/api/lead.ts`. In step 5
it becomes a real Worker entrypoint — `main` in `wrangler.jsonc`, routing `/api/lead` itself
and falling through to `env.ASSETS.fetch()` for everything else. D1 and KV bindings attach to
that same Worker, which is if anything simpler than the Pages Functions split.

The conclusion of decision 1 stands: no `@astrojs/cloudflare` adapter. Astro still builds a
plain static site; the Worker serves it.

## 17. Per-locale 404 pages need an explicit build step

Astro special-cases only the root `404.astro`, emitting it as `404.html`. Every other
locale's 404 lands at `<locale>/404/index.html`. Cloudflare's `not_found_handling:
"404-page"` walks up the tree looking for `404.html` specifically, so `/ar/does-not-exist`
would have fallen through to the *English* 404.

A small `astro:build:done` integration copies each locale's 404 to `<locale>/404.html`. The
sitemap filter excludes anything noindexed by path segment rather than by hand-written
regex — `/ar/404/` had already slipped into the sitemap once before that was tightened.

## 18. Canonicals, not a noindex flag, protect the temp domain

The site went live on `powersourcedigital.pages.dev` before the custom domain was attached.
That deployment is fully crawlable and its `robots.txt` explicitly invites Googlebot, so
without intervention it would compete with `powersourcedigital.com` for identical content —
a duplicate-content problem on a project whose entire point is SEO.

Every indexable page now carries a self-referencing canonical that is **always absolute and
always on the production domain**, never on the host that happens to be serving. Google
consolidates the temp domain into the real one on its own.

The rejected alternative was `X-Robots-Tag: noindex` on preview deployments. It works, but
it has to be switched off at launch, and forgetting to switch it off deindexes the live
site. A canonical needs no launch-day action and cannot fail that way.

`Astro.url.pathname` arrives percent-encoded for Arabic routes, so it is decoded before
`href()` re-encodes it. That keeps canonicals byte-identical to the hrefs emitted everywhere
else — a canonical that differs from the linked URL by even its encoding is a canonical
Google may ignore. Round-trip verified for Arabic service and city paths.

Noindexed pages (styleguide, both 404s) deliberately emit **no** canonical.

**For the cutover checklist:** once `powersourcedigital.com` is attached, add a Cloudflare
redirect rule sending `powersourcedigital.pages.dev/*` to the custom domain, so the temp
host stops serving content at all.

## 19. The homepage is not a re-skin of the WordPress site

The old site's homepage is hero → five services → why us → process → CTA. Rebuilding that
with nicer type would be a redesign, not an improvement, so two sections were added that the
old site does not have and that address why its offer converts poorly.

**"What we actually look at."** "Get a free audit" is the same sentence every agency in
Riyadh uses, and it converts badly because nobody knows what they are agreeing to. The
section lists the real checks — site, Google presence, competitors — and states plainly that
some findings will be things the reader can fix themselves. Naming what is inspected turns a
slogan into an offer.

**A homepage FAQ answering the objections that actually block a sale:** is it really free,
do we have to move to you, who owns the site, how do you charge. These are the questions
that stop an enquiry, and answering them before the form is a conversion decision as much
as an SEO one.

## 20. The FAQ accordion is native `<details>`, not an ARIA widget

Expand/collapse, keyboard operation, focus handling and the exposed open state all come free
from the element, and it works with zero JavaScript. A hand-built ARIA accordion would be
more code, more to get wrong, and non-functional before hydration.

`name="faq"` makes the group exclusive natively — one open at a time, no script.

## 21. FAQ markup is generated from the rendered array

`faqPage()` takes the same array the accordion renders. There is no second copy of the
questions to fall out of sync. A `FAQPage` whose markup disagrees with the visible answer is
a structured-data policy violation, not merely a bug.

`AggregateRating` and `Review` are deliberately absent from `schema.ts`. There are no genuine
reviews yet, and fabricating them risks a manual action. They go in when real ones exist.

## 22. Page weight

Homepage, gzipped, including all inlined JavaScript: **16.3 kb English, 17.5 kb Arabic**,
against a 120 kb budget. Astro inlines the component scripts, so there is no separate bundle
request; fonts are additional and subset by `unicode-range`.
