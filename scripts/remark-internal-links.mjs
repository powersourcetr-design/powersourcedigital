/**
 * Resolves `route:` links in markdown against src/i18n/routes.ts.
 *
 * Posts are the one place where the "nothing hardcodes an href" rule was being
 * broken, because markdown has no way to call a function. Writing the path by
 * hand is survivable in English and a trap in Arabic, where the correct link is
 * `/ar/%D8%A7%D9%84%D8%AE%D8%AF%D9%85%D8%A7%D8%AA/...` — nobody proofreads that,
 * and a single wrong byte is a 404 that looks like a working link.
 *
 * So a post writes the route key and the plugin resolves it, in the locale of
 * the file it is resolving:
 *
 *   [our SEO service](route:serviceDetail/seo)
 *   [e-commerce development](route:landingEcommerce)
 *   [what a store costs](route:blogPost/ecommerce-website-cost-saudi-arabia)
 *
 * An unknown route key throws at build time rather than emitting a dead link,
 * which is the entire point: a broken internal link should stop the build, not
 * ship quietly and leak crawl budget.
 *
 * The mdast walk is hand-rolled rather than pulling in `unist-util-visit`. It
 * is available transitively today, but depending on another package's
 * dependency is how a build breaks on an unrelated upgrade, and the whole
 * traversal is six lines. Cost: 0 kb.
 */

const PREFIX = 'route:'

/** Locale is decided by the directory the file sits in — `/blog/ar/…`. */
function localeOf(path) {
  const normalised = String(path).replace(/\\/g, '/')
  return /\/(?:blog|services)\/ar\//.test(normalised) ? 'ar' : 'en'
}

function walk(node, visitor) {
  visitor(node)
  for (const child of node.children ?? []) walk(child, visitor)
}

/**
 * @param {{ href: (path: string) => string, localizedPath: (key: any, locale: any, slug?: string) => string, servicePath: (key: any, locale: any) => string }} routes
 *   Passed in from astro.config.mjs rather than imported here, so this file
 *   stays plain JS and the route table has exactly one definition.
 *
 *   `localizedPath` really takes a `RouteKey`, not a string. The widening to
 *   `any` is the honest description of what happens here: the key arrives from
 *   markdown as arbitrary text and cannot be narrowed until it is checked, so
 *   it is checked at runtime instead and a bad one fails the build below.
 */
export function internalLinks({ href, localizedPath, servicePath }) {
  return function transformer(tree, file) {
    // Astro runs the markdown pipeline more than once per entry, and the vfile
    // is not present on every pass. Reading it defensively keeps a genuine
    // error (an unknown route key) from being masked by a TypeError about an
    // undefined `file`, which is what happened the first time this was tested.
    const path = file?.path ?? file?.history?.[0] ?? ''
    const locale = localeOf(path)

    walk(tree, (node) => {
      if (node.type !== 'link' || typeof node.url !== 'string') return
      if (!node.url.startsWith(PREFIX)) return

      const [key, ...rest] = node.url.slice(PREFIX.length).split('/')
      const slug = rest.join('/')

      try {
        // `route:service/<key>` resolves the slug for this file's locale, so an
        // Arabic post links to the Arabic service URL without ever naming it.
        // Writing `serviceDetail/<slug>` instead would push that lookup back
        // onto the author, which is the problem this plugin exists to remove.
        node.url =
          key === 'service'
            ? href(servicePath(slug, locale))
            : href(localizedPath(key, locale, slug || undefined))
      } catch (cause) {
        throw new Error(
          `Unknown route link "${node.url}"${path ? ` in ${path}` : ''}. ` +
            'Route keys come from ROUTES in src/i18n/routes.ts.',
          { cause },
        )
      }
    })
  }
}
