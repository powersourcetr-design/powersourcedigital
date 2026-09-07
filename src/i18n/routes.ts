/**
 * The single source of truth for every URL on this site.
 *
 * Nothing in `src/` may hardcode an href. Every link is built through
 * `localizedPath()` so that an EN route and its AR twin can never drift,
 * and so the hreflang cluster on each page is generated from the same
 * data that generated the link.
 *
 * Arabic paths are authored in Arabic script here and percent-encoded only
 * at the moment of output (see `href()`), so this file stays readable.
 */

export const LOCALES = ['en', 'ar'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'
export const SITE = 'https://powersourcedigital.com'

/** BCP-47 tags used in <html lang>, hreflang and OG locale. */
export const LOCALE_TAG: Record<Locale, string> = {
  en: 'en',
  ar: 'ar-SA',
}

export const DIR: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
}

/** The `/ar` prefix. English is unprefixed (`prefixDefaultLocale: false`). */
const LOCALE_PREFIX: Record<Locale, string> = {
  en: '',
  ar: 'ar',
}

type Segment = Record<Locale, string>

interface RouteDef {
  /** Path segment in each locale. Empty string = this route adds no segment. */
  readonly segment: Segment
  /**
   * Parent route key; the full path is the parent chain plus this segment.
   *
   * Typed as `string` rather than `RouteKey` because `RouteKey` is derived from
   * `ROUTES`, which is itself constrained by this interface — naming it here
   * makes the type circular. `ParentsAreValid` below restores the check once
   * `ROUTES` exists, so an invalid parent is still a compile-time error.
   */
  readonly parent?: string
  /** True when the route needs a trailing slug supplied by the caller. */
  readonly dynamic?: boolean
}

/**
 * Route keys are the stable internal names. They never appear in a URL,
 * so renaming an Arabic slug is a one-line change here and nothing else.
 */
export const ROUTES = {
  home: { segment: { en: '', ar: '' } },

  services: { segment: { en: 'services', ar: 'الخدمات' } },
  serviceDetail: { parent: 'services', segment: { en: '', ar: '' }, dynamic: true },

  about: { segment: { en: 'about', ar: 'من-نحن' } },
  contact: { segment: { en: 'contact', ar: 'تواصل-معنا' } },
  freeAudit: { segment: { en: 'free-audit', ar: 'تدقيق-مجاني' } },
  thankYou: { segment: { en: 'thank-you', ar: 'شكرا' } },

  /* Paid-traffic landing pages. These sit at the root rather than under
     /services/ so the ad destination URL carries the keyword itself. */
  landingEcommerce: {
    segment: { en: 'ecommerce-development', ar: 'تصميم-متجر-الكتروني' },
  },
  landingWebDesign: {
    segment: { en: 'web-design-riyadh', ar: 'تصميم-مواقع-الرياض' },
  },

  work: { segment: { en: 'work', ar: 'أعمالنا' } },
  workDetail: { parent: 'work', segment: { en: '', ar: '' }, dynamic: true },

  pricing: { segment: { en: 'pricing', ar: 'الأسعار' } },
  process: { segment: { en: 'process', ar: 'طريقة-العمل' } },

  blog: { segment: { en: 'blog', ar: 'المدونة' } },
  blogPost: { parent: 'blog', segment: { en: '', ar: '' }, dynamic: true },

  glossary: { segment: { en: 'glossary', ar: 'المصطلحات' } },
  glossaryTerm: { parent: 'glossary', segment: { en: '', ar: '' }, dynamic: true },

  industries: { segment: { en: 'industries', ar: 'القطاعات' } },
  industryDetail: { parent: 'industries', segment: { en: '', ar: '' }, dynamic: true },

  /** Service x City and comparison pages sit at the root for keyword proximity. */
  cityService: { segment: { en: '', ar: '' }, dynamic: true },
  comparison: { segment: { en: '', ar: '' }, dynamic: true },

  tools: { segment: { en: 'tools', ar: 'أدوات' } },
  toolDetail: { parent: 'tools', segment: { en: '', ar: '' }, dynamic: true },

  privacy: { segment: { en: 'privacy', ar: 'سياسة-الخصوصية' } },
  terms: { segment: { en: 'terms', ar: 'الشروط' } },

  notFound: { segment: { en: '404', ar: '404' } },
  styleguide: { segment: { en: 'styleguide', ar: 'styleguide' } },
} as const satisfies Record<string, RouteDef>

export type RouteKey = keyof typeof ROUTES

/**
 * Restores the constraint that `RouteDef.parent` could not express: every
 * `parent` above must name a real route key.
 *
 * Each route maps to `true` or to a descriptive tuple, and the union of those
 * is compared against `true` in a tuple wrapper — `[U] extends [true]` is only
 * satisfied when *every* member is `true`. A bare union would silently pass,
 * because `true` is assignable to `true | SomethingElse`.
 */
type ParentCheck = {
  [K in RouteKey]: (typeof ROUTES)[K] extends { readonly parent: infer P }
    ? P extends RouteKey
      ? true
      : ['Invalid parent on route', K, P]
    : true
}[RouteKey]

type Assert<T extends true> = T

/** Compile error if any route above names a parent that does not exist. */
export type ParentsAreValid = Assert<
  [ParentCheck] extends [true] ? true : ['Invalid parent route key', ParentCheck]
>

/**
 * Routes that have actual pages behind them today.
 *
 * The header, the mobile menu and the footer all filter their links through
 * this, so a route defined in the map but not yet built is simply absent from
 * navigation rather than a link into a 404. Add a key here in the same commit
 * that adds its page — the build fails loudly if the page is missing, which is
 * the point.
 */
export const LIVE_ROUTES: readonly RouteKey[] = [
  'home',
  'services',
  'serviceDetail',
  'about',
  'contact',
  'process',
  'freeAudit',
  'thankYou',
  'blog',
  'blogPost',
  'landingEcommerce',
  'landingWebDesign',
]

export function isLive(key: RouteKey): boolean {
  return LIVE_ROUTES.includes(key)
}

/** Routes kept out of the sitemap and marked noindex. */
export const NOINDEX_ROUTES: readonly RouteKey[] = ['styleguide', 'thankYou', 'notFound']

function segmentsFor(key: RouteKey, locale: Locale): string[] {
  const def = ROUTES[key] as RouteDef
  const own = def.segment[locale]
  // Safe: `ParentsAreValid` has already proven every `parent` is a RouteKey.
  const parentSegments = def.parent ? segmentsFor(def.parent as RouteKey, locale) : []
  return own ? [...parentSegments, own] : parentSegments
}

/**
 * Build the site-relative path for a route, always with a leading and
 * trailing slash so it matches Astro's `trailingSlash: 'always'`.
 *
 * @param slug required for dynamic routes, already localized for `locale`
 */
export function localizedPath(key: RouteKey, locale: Locale, slug?: string): string {
  const def = ROUTES[key] as RouteDef
  if (def.dynamic && !slug) {
    throw new Error(`localizedPath: route "${key}" is dynamic and needs a slug`)
  }
  if (!def.dynamic && slug) {
    throw new Error(`localizedPath: route "${key}" is static and takes no slug`)
  }

  const parts = [LOCALE_PREFIX[locale], ...segmentsFor(key, locale)]
  if (slug) parts.push(slug)

  const path = parts.filter(Boolean).join('/')
  return path ? `/${path}/` : '/'
}

/** Percent-encode Arabic segments for output in href/canonical/sitemap. */
export function href(path: string): string {
  return path
    .split('/')
    .map((s) => (s ? encodeURIComponent(s) : s))
    .join('/')
}

/** Absolute URL, encoded — for canonical, hreflang, OG and sitemap entries. */
export function absoluteUrl(path: string): string {
  return `${SITE}${href(path)}`
}

/**
 * The full hreflang cluster for one page. `slugs` maps each locale to that
 * locale's slug and is only needed for dynamic routes. Returning every locale
 * plus x-default from one call is what stops the cluster from drifting.
 */
export function alternates(
  key: RouteKey,
  slugs?: Partial<Record<Locale, string>>,
): { hreflang: string; url: string }[] {
  const isDynamic = (ROUTES[key] as RouteDef).dynamic === true

  // A dynamic route only exists in a locale we hold a slug for. Blog posts are
  // deliberately allowed to be single-language — an article written for the
  // Saudi market does not always have an English counterpart worth writing —
  // so the missing half has to be omitted rather than guessed at. Emitting an
  // hreflang for a page nobody authored advertises a 404 to Google, and
  // building that URL throws anyway, because a dynamic route needs a slug.
  const available = LOCALES.filter((locale) => !isDynamic || Boolean(slugs?.[locale]))

  // One language is not a cluster. hreflang describes alternatives, and a page
  // whose only alternative is itself says nothing worth serialising.
  if (available.length < 2) return []

  const entries = available.map((locale) => ({
    hreflang: LOCALE_TAG[locale],
    url: absoluteUrl(localizedPath(key, locale, slugs?.[locale])),
  }))

  // x-default heads the cluster with the default locale where it exists, and
  // otherwise with whichever locale does, so it never names a missing page.
  const fallbackLocale = available.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : available[0]
  if (!fallbackLocale) return entries

  return [
    ...entries,
    {
      hreflang: 'x-default',
      url: absoluteUrl(localizedPath(key, fallbackLocale, slugs?.[fallbackLocale])),
    },
  ]
}

/** The equivalent page in the other language, for the language switcher. */
export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'ar' : 'en'
}

/** True for routes that need a slug — service details, blog posts and the rest. */
export function isDynamic(key: RouteKey): boolean {
  return (ROUTES[key] as RouteDef).dynamic === true
}

/**
 * The index a page belongs under, for when its twin in the other language does
 * not exist: a blog post falls back to the blog, a service to the services
 * index. Pages with no parent fall back to home, which is the section index for
 * anything that is not in a section.
 */
export function sectionIndex(key: RouteKey): RouteKey {
  const parent = (ROUTES[key] as RouteDef).parent
  return parent && parent in ROUTES ? (parent as RouteKey) : 'home'
}
