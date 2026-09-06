// @ts-check
import { copyFile } from 'node:fs/promises'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

/**
 * Astro special-cases only the root `404.astro`, emitting it as `404.html`.
 * Any other locale's 404 lands at `<locale>/404/index.html`, which Cloudflare's
 * `not_found_handling: "404-page"` will not find — it walks up the tree looking
 * for `404.html`. This copies each locale's 404 to where the runtime looks, so
 * an unknown `/ar/...` URL returns the Arabic 404 rather than the English one.
 *
 * @param {readonly string[]} locales Locale prefixes that have their own 404 page.
 * @returns {import('astro').AstroIntegration}
 */
function localeNotFoundPages(locales) {
  return {
    name: 'psd:locale-404',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        for (const locale of locales) {
          const from = new URL(`./${locale}/404/index.html`, dir)
          const to = new URL(`./${locale}/404.html`, dir)
          await copyFile(from, to)
          logger.info(`emitted ${locale}/404.html`)
        }
      },
    },
  }
}

/**
 * Static output, no adapter.
 *
 * The brief asked for `@astrojs/cloudflare` with `output: 'static'`. Those are
 * mutually exclusive: the adapter exists to run Astro on Cloudflare Workers and
 * requires an on-demand output mode. A fully prerendered site needs no adapter
 * at all, and form handling is served by Cloudflare Pages Functions in
 * `functions/`, which are deployed alongside the static assets. See DECISIONS.md.
 */
export default defineConfig({
  site: 'https://powersourcedigital.com',
  trailingSlash: 'always',
  output: 'static',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar'],
    routing: {
      prefixDefaultLocale: false,
      // No `fallback` key: every Arabic page is authored, never rewritten from English.
    },
  },

  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },

  image: {
    // Sharp is the default; named here so the AVIF/WebP pipeline is explicit.
    service: { entrypoint: 'astro/assets/services/sharp' },
  },

  integrations: [
    mdx(),
    localeNotFoundPages(['ar']),
    sitemap({
      // Anything noindexed must also stay out of the sitemap. Listed as encoded
      // segments because Arabic slugs reach this filter percent-encoded.
      filter: (page) => {
        const excluded = [
          'styleguide',
          '404',
          'thank-you',
          '%D8%B4%D9%83%D8%B1%D8%A7-%D9%84%D9%83', // شكرا-لك
        ]
        const segments = new URL(page).pathname.split('/').filter(Boolean)
        return !segments.some((segment) => excluded.includes(segment))
      },
      // NOTE: this emits a plain sitemap only. Our EN and AR slugs are not
      // mirrored, so @astrojs/sitemap's `i18n` option cannot express the
      // hreflang cluster. Step 6 replaces this with a custom endpoint driven
      // by src/i18n/routes.ts so the alternates cannot drift.
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
})
