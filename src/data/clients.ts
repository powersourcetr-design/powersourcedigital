import type { Locale } from '@/i18n/routes'

/**
 * The trust strip under the hero.
 *
 * Client logos are **auto-discovered** from `src/assets/clients/`. Drop image
 * files in that folder and they appear on the next build — there is no list to
 * edit and no import to add, because a step you have to remember is a step that
 * gets skipped.
 *
 * The displayed name comes from the filename, so name files after the client:
 * `acme-industrial.png` renders as "Acme Industrial". That name is the alt
 * text, so it matters for accessibility as well as for looking right.
 *
 * Until the folder has something in it the strip shows the platforms PSD builds
 * on. That is a true claim, it answers a real buyer question, and it occupies
 * the slot a fabricated client list would otherwise be tempting to fill.
 */

const modules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/clients/*.{png,jpg,jpeg,svg,webp,avif}',
  { eager: true },
)

export interface ClientLogo {
  name: string
  logo: ImageMetadata
}

/** `acme-industrial.png` → `Acme Industrial` */
function nameFromPath(path: string): string {
  const file = path.split('/').pop() ?? path
  return file
    .replace(/\.[a-z]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export const CLIENTS: ClientLogo[] = Object.entries(modules)
  .map(([path, mod]) => ({ name: nameFromPath(path), logo: mod.default }))
  .sort((a, b) => a.name.localeCompare(b.name))

/** Platforms we build on and manage. Wordmarks, set in type — no trademark art. */
export const PLATFORMS = [
  'WordPress',
  'Shopify',
  'Salla',
  'Zid',
  'Amazon.sa',
  'Noon',
  'Webflow',
  'Wix',
  'Google Business Profile',
] as const

export const STRIP_LABEL: Record<Locale, { clients: string; platforms: string }> = {
  en: {
    clients: 'Businesses we have worked with',
    platforms: 'Platforms we build on and manage',
  },
  ar: {
    clients: 'جهات عملنا معها',
    platforms: 'المنصات التي نبني عليها وندير حساباتها',
  },
}
