import type { ImageMetadata } from 'astro'
import type { Locale } from '@/i18n/routes'
import raw from './portfolio.json'

/**
 * The portfolio, loaded from JSON and paired with real image metadata.
 *
 * Not a content collection. The two existing collections are markdown with
 * bodies; this is a flat record with no prose, and the thing it actually needs
 * — `ImageMetadata` for `<Image>`, so widths and formats are generated at build
 * time — comes from `import.meta.glob`, which is how `clients.ts` already
 * resolves its logos. Wrapping it in a `file()` collection would add a schema
 * layer and still leave the images to resolve separately.
 *
 * Screenshots are committed assets, captured once. Nothing here fetches a
 * client site at build time: a build that depends on twenty-five third-party
 * sites being up is a build that fails for reasons you do not control.
 */

export type Category = 'saudi' | 'store' | 'business'

interface Bilingual {
  en: string
  ar: string
}

/** The shape as authored in portfolio.json. */
interface RawProject {
  order: number
  slug: string
  name: string
  nameAr: string
  kind: Bilingual
  country: Bilingual
  industry: Bilingual
  tags: string[]
  category: Category
  featured: boolean
  url: string | null
  domain: string | null
  images: { front: string; back?: string; mobile?: string; thumb: string }
  /** Capture provenance. Internal only — never rendered. */
  sourceNote: string
}

export interface Project extends Omit<RawProject, 'images' | 'sourceNote'> {
  images: {
    front: ImageMetadata
    back?: ImageMetadata | undefined
    mobile?: ImageMetadata | undefined
    thumb: ImageMetadata
  }
}

const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/portfolio/**/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
)

/** JSON paths are relative to src/assets/; the glob keys are absolute. */
function resolve(path: string, slug: string, which: string): ImageMetadata {
  const found = files[`/src/assets/${path}`]
  if (!found) {
    // A missing screenshot is a broken card, and a broken card on a page whose
    // entire job is showing finished work is worse than the page not existing.
    // Failing the build is the only honest response.
    throw new Error(
      `portfolio: ${slug} declares ${which} at "${path}", which is not in src/assets/. ` +
        'Add the file or correct the path in portfolio.json.',
    )
  }
  return found.default
}

const projects: Project[] = (raw as RawProject[])
  .map(({ images, sourceNote: _sourceNote, ...rest }) => ({
    ...rest,
    images: {
      front: resolve(images.front, rest.slug, 'front'),
      thumb: resolve(images.thumb, rest.slug, 'thumb'),
      back: images.back ? resolve(images.back, rest.slug, 'back') : undefined,
      mobile: images.mobile ? resolve(images.mobile, rest.slug, 'mobile') : undefined,
    },
  }))
  .sort((a, b) => a.order - b.order)

// Two slugs pointing at one project would silently drop a card from the grid.
const seen = new Set<string>()
for (const project of projects) {
  if (seen.has(project.slug)) throw new Error(`portfolio: duplicate slug "${project.slug}"`)
  seen.add(project.slug)
}

export const PROJECTS: readonly Project[] = projects

/** The homepage slider: the eight marked featured, in authored order. */
export const FEATURED: readonly Project[] = projects.filter((project) => project.featured)

/**
 * Counts for the portfolio hero, derived rather than written down, so the
 * sentence cannot drift from the data the page below it renders.
 * Countries are de-duplicated and the blank ones — genuinely unknown, not
 * missing — are excluded rather than counted as a country called "".
 */
export const TOTALS = {
  projects: projects.length,
  countries: new Set(projects.map((p) => p.country.en).filter(Boolean)).size,
} as const

/** Name in the reading language. Latin brand names stay Latin in Arabic. */
export function nameFor(project: Project, locale: Locale): string {
  return locale === 'ar' ? project.nameAr : project.name
}

/**
 * "Country · Industry", with the separator only where both sides exist —
 * four projects have no known country and would otherwise render a stray dot.
 */
export function metaLine(project: Project, locale: Locale): string {
  return [project.country[locale], project.industry[locale]].filter(Boolean).join(' · ')
}
