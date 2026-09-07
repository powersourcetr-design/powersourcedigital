import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { LOCALES } from './i18n/routes'

/**
 * Every collection is bilingual by construction.
 *
 * `translationKey` is what pairs an English entry with its Arabic twin — it is
 * the only link between them, and hreflang, the language switcher and the
 * sitemap all read from it. Two entries sharing a key must describe the same
 * page; nothing else enforces that, so it is checked at build time in
 * `src/lib/content.ts`.
 *
 * The SEO fields are required rather than optional on purpose: a page that
 * ships without a description or a primary keyword is a page nobody decided
 * anything about. Missing one fails the build.
 */

const locale = z.enum(LOCALES)

/** Shared by every routable content type. */
const seoFields = {
  title: z.string().min(1).max(70),
  /** Rendered in <title>. Kept short enough that Google will not truncate it. */
  metaTitle: z.string().min(1).max(60),
  /** Length is bounded per locale in src/lib/content.ts, not here — see there. */
  description: z.string().min(1),
  primaryKeyword: z.string().min(1),
  secondaryKeywords: z.array(z.string()).default([]),
  searchIntent: z.enum(['informational', 'commercial', 'transactional', 'navigational']),
  locale,
  translationKey: z.string().min(1),
  updatedAt: z.coerce.date(),
  draft: z.boolean().default(false),
}

const faq = z
  .array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
    }),
  )
  .default([])

const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '**/*.md' }),
  schema: z.object({
    ...seoFields,
    /** Must match a key in src/i18n/slugs.ts SERVICES. Verified at build time. */
    service: z.string().min(1),
    /** Ordering on the services grid. Lower comes first. */
    order: z.number().int().min(1),
    /** One line, shown on the service card. No full stop. */
    tagline: z.string().min(1).max(80),
    /** Two sentences at most, shown under the tagline on the card. */
    summary: z.string().min(1).max(260),
    /** What the client actually receives. Rendered as the "what is included" list. */
    deliverables: z.array(z.string().min(1)).min(3),
    /** Named platforms, where the service has them. */
    platforms: z.array(z.string().min(1)).default([]),
    faq,
  }),
})

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    ...seoFields,
    /** Publication date. Drives ordering and the Article schema. */
    publishedAt: z.coerce.date(),
    /** Shared tags drive the related-posts block. At least one is required. */
    tags: z.array(z.string().min(1)).min(1),
    /**
     * Route key of the landing page this post supports. Every post links to it
     * inside the first 200 words and again in the conclusion, which is what
     * makes a content cluster a cluster rather than a pile of articles.
     */
    cluster: z.enum(['landingEcommerce', 'landingWebDesign', 'none']),
    /** Rough reading time in minutes, shown on the index. */
    readingMinutes: z.number().int().min(1).max(30),
    faq,
  }),
})

export const collections = { services, blog }
