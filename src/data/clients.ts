import type { Locale } from '@/i18n/routes'

/**
 * The trust strip under the hero.
 *
 * `CLIENTS` is empty because there are no client logos yet and inventing them
 * is not an option — a fabricated client list is the fastest way to lose a deal
 * when someone recognises a brand you never worked with. Drop real entries in
 * and the strip switches to them automatically (see LogoStrip.astro).
 *
 * Until then the strip shows the platforms PSD actually builds on, which is a
 * true claim, useful to a buyer deciding whether you handle their stack, and
 * the standard fallback for an agency that has not published case studies yet.
 *
 * To add a client: put the logo in src/assets/clients/, import it here, and add
 * `{ name, logo }`. Get written permission to display it first.
 */

export interface ClientLogo {
  name: string
  /** Imported image asset. Astro optimises and serves it. */
  logo: ImageMetadata
}

export const CLIENTS: ClientLogo[] = []

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
    clients: 'Businesses we work with',
    platforms: 'Platforms we build on and manage',
  },
  ar: {
    clients: 'شركات نعمل معها',
    platforms: 'المنصات التي نبني عليها وندير حساباتها',
  },
}
