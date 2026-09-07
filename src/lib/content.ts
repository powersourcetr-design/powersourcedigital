import { type CollectionEntry, getCollection } from 'astro:content'
import type { Locale } from '@/i18n/routes'
import { SERVICES, type ServiceKey } from '@/i18n/slugs'

export type ServiceEntry = CollectionEntry<'services'>

/**
 * Loads the services for one locale, ordered for display.
 *
 * The two assertions below are the point of this module. Zod validates each
 * file in isolation, but it cannot see that an English entry has an Arabic
 * twin, or that `service: seo` names a route that exists. Both are the kind of
 * mistake that produces a silently half-built site — a language switcher that
 * dead-ends, or a card linking to a 404 — so they fail the build instead.
 */
export async function getServices(locale: Locale): Promise<ServiceEntry[]> {
  const all = await getCollection('services', ({ data }) => !data.draft)

  assertEveryServiceIsTranslated(all)
  assertServiceKeysExist(all)
  assertDescriptionLength(all)

  return all
    .filter((entry) => entry.data.locale === locale)
    .sort((a, b) => a.data.order - b.data.order)
}

export async function getServiceEntry(
  translationKey: string,
  locale: Locale,
): Promise<ServiceEntry> {
  const services = await getServices(locale)
  const found = services.find((entry) => entry.data.translationKey === translationKey)
  if (!found) {
    throw new Error(`No "${locale}" service content for translationKey "${translationKey}"`)
  }
  return found
}

/**
 * Meta description length, bounded per locale.
 *
 * Google truncates by pixel width rather than character count, and Arabic
 * carries noticeably more meaning per character than English — a well-written
 * Arabic description lands naturally around 120-145 characters. Holding it to
 * the English 140-158 band forces padding, and a padded description makes a
 * worse snippet than a short one.
 *
 * This lives here rather than in the Zod schema because expressing it there
 * needs `superRefine`, which returns a `ZodEffects` that Astro cannot infer
 * entry field types through — every `entry.data.x` silently became `any`.
 * A schema that types its own output is worth more than a check living in the
 * most obvious file.
 */
const DESCRIPTION_LENGTH: Record<Locale, { min: number; max: number }> = {
  en: { min: 140, max: 158 },
  ar: { min: 110, max: 160 },
}

function assertDescriptionLength(entries: ServiceEntry[]): void {
  const bad = entries.flatMap((entry) => {
    const { min, max } = DESCRIPTION_LENGTH[entry.data.locale]
    const length = [...entry.data.description].length
    return length < min || length > max
      ? [`${entry.id} is ${length} chars (${entry.data.locale} needs ${min}-${max})`]
      : []
  })

  if (bad.length > 0) {
    throw new Error(
      `Meta descriptions out of bounds: ${bad.join('; ')}. Rewrite them rather than padding.`,
    )
  }
}

function assertEveryServiceIsTranslated(entries: ServiceEntry[]): void {
  const byKey = new Map<string, Set<Locale>>()
  for (const entry of entries) {
    const locales = byKey.get(entry.data.translationKey) ?? new Set<Locale>()
    locales.add(entry.data.locale)
    byKey.set(entry.data.translationKey, locales)
  }

  const incomplete = [...byKey.entries()]
    .filter(([, locales]) => !(locales.has('en') && locales.has('ar')))
    .map(([key, locales]) => `"${key}" (only ${[...locales].join(', ')})`)

  if (incomplete.length > 0) {
    throw new Error(
      `Untranslated service content: ${incomplete.join('; ')}. ` +
        'Every service needs both an en and an ar file, or hreflang and the ' +
        'language switcher will point at pages that do not exist.',
    )
  }
}

function assertServiceKeysExist(entries: ServiceEntry[]): void {
  const known = new Set<string>(SERVICES.map((service) => service.key))
  const unknown = entries
    .filter((entry) => !known.has(entry.data.service))
    .map((entry) => `${entry.id} → "${entry.data.service}"`)

  if (unknown.length > 0) {
    throw new Error(
      `Service content references unknown service keys: ${unknown.join('; ')}. ` +
        `Known keys: ${[...known].join(', ')} (see src/i18n/slugs.ts).`,
    )
  }
}

/** Narrow the loosely-typed frontmatter field to the route key union. */
export function serviceKeyOf(entry: ServiceEntry): ServiceKey {
  return entry.data.service as ServiceKey
}
