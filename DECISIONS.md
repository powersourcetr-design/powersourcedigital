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
