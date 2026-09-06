// @ts-check
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

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
    sitemap({
      filter: (page) =>
        !/\/(styleguide|thank-you|%D8%B4%D9%83%D8%B1%D8%A7-%D9%84%D9%83)\//.test(page),
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
