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

/**
 * Meta description length, per locale.
 *
 * Google truncates by pixel width, not character count, and Arabic carries
 * noticeably more meaning per character than English — a well-written Arabic
 * description lands naturally around 120-145 characters. Holding it to the
 * English 140-158 band would force padding, and a padded description is a
 * worse snippet than a short one. So the bound is locale-aware rather than a
 * single number copied from an English SEO checklist.
 */
const DESCRIPTION_LENGTH: Record<(typeof LOCALES)[number], { min: number; max: number }> = {
  en: { min: 140, max: 158 },
  ar: { min: 110, max: 160 },
}

/** Shared by every routable content type. */
const seoFields = {
  title: z.string().min(1).max(70),
  /** Rendered in <title>. Kept short enough that Google will not truncate it. */
  metaTitle: z.string().min(1).max(60),
  /** Bounds enforced per locale by `withDescriptionBounds` below. */
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

/** Applies the locale-aware description bounds to any schema carrying both fields. */
function withDescriptionBounds<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((value, ctx) => {
    const { description, locale: entryLocale } = value as {
      description: string
      locale: (typeof LOCALES)[number]
    }
    const { min, max } = DESCRIPTION_LENGTH[entryLocale]
    const length = [...description].length

    if (length < min || length > max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['description'],
        message:
          `Meta description is ${length} characters; "${entryLocale}" pages must be ` +
          `${min}-${max}. Rewrite it rather than padding it.`,
      })
    }
  })
}

const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '**/*.md' }),
  schema: withDescriptionBounds(
    z.object({
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
  ),
})

export const collections = { services }
