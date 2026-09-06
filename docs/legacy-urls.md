# Legacy URL inventory — powersourcedigital.com (WordPress/Elementor on Hostinger)

Crawled 2026-09-06 from `https://powersourcedigital.com/wp-sitemap.xml` (native WordPress
sitemap; no Yoast/RankMath), plus a link crawl of the rendered homepage and one service page,
plus direct HTTP probes for common paths.

**24 URLs total.** The site was published 2026-08-29/30 — one week before this crawl — so
there is effectively no accumulated ranking equity. Redirects below are cheap insurance
rather than the rescue of established positions.

## English (11 pages)

| Live URL | Status | New URL | Action |
|---|---|---|---|
| `/` | 200 | `/` | keep |
| `/services/` | 200 | `/services/` | keep |
| `/services/website-design-development/` | 200 | same | keep |
| `/services/seo/` | 200 | same | keep |
| `/services/google-business-profile-optimization/` | 200 | same | keep |
| `/services/graphic-design/` | 200 | same | keep |
| `/services/e-commerce-management/` | 200 | same | keep |
| `/about/` | 200 | `/about/` | keep |
| `/contact/` | 200 | `/contact/` | keep |
| `/free-audit/` | 200 | `/free-audit/` | keep |
| `/portfolio/` | 200 | `/work/` | **301** |

## Arabic (11 pages)

Live Arabic URLs are percent-encoded; decoded forms shown for readability.

| Live URL (decoded) | New URL | Action |
|---|---|---|
| `/ar/` | `/ar/` | keep |
| `/ar/خدماتنا/` | `/ar/الخدمات/` | **301** |
| `/ar/خدماتنا/تصميم-المواقع/` | `/ar/الخدمات/تصميم-وتطوير-المواقع/` | **301** |
| `/ar/خدماتنا/تحسين-محركات-البحث/` | `/ar/الخدمات/تحسين-محركات-البحث/` | **301** |
| `/ar/خدماتنا/الملف-التجاري-جوجل/` | `/ar/الخدمات/تحسين-الملف-التجاري-على-جوجل/` | **301** |
| `/ar/خدماتنا/التصميم-الجرافيكي/` | `/ar/الخدمات/التصميم-الجرافيكي/` | **301** |
| `/ar/خدماتنا/إدارة-المتاجر-الإلكترونية/` | `/ar/الخدمات/إدارة-المتاجر-الإلكترونية/` | **301** |
| `/ar/من-نحن/` | `/ar/من-نحن/` | keep |
| `/ar/تواصل-معنا/` | `/ar/تواصل-معنا/` | keep |
| `/ar/تقييم-مجاني/` | `/ar/تدقيق-مجاني/` | **301** |
| `/ar/أعمالنا/` | `/ar/أعمالنا/` | keep |

### Why the Arabic services slug changes

Live is `خدماتنا` ("our services") — branded and possessive. The replacement `الخدمات`
("the services") matches how the term is actually searched. With one week of history the
swap costs nothing and the keyword match is materially better.

## Other

| Live URL | Status | Action |
|---|---|---|
| `/hello-world/` | 200 | **301** → `/blog/` (default WordPress sample post; should never have shipped) |
| `/category/blog/` | 200 | **301** → `/blog/` |
| `/privacy-policy/` | **404** | linked in the live footer but broken — new site serves `/privacy/` |
| `/terms/` | **404** | linked in the live footer but broken — new site serves `/terms/` |

Probed and confirmed absent (no redirect needed): `/privacy/`, `/work/`, `/blog/`,
`/pricing/`, `/process/`.

## Assets

`/wp-content/uploads/2026/08/logo.jpg` — the site's only logo file. It is **the PST logo**,
not a Power Source Digital mark. Saved to `brand-source/psd-live-logo.jpg`. See
CONTENT-NEEDED.md.

## Two live-site defects worth fixing regardless

1. Both footer legal links (`/privacy-policy/`, `/terms/`) return 404 on every page.
2. `/hello-world/` is indexed in the sitemap.
