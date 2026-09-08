/**
 * Every tracking identifier lives here. Swap the GTM container in one place.
 *
 * Consent Mode is set to *denied* by default before GTM loads, which is what
 * PDPL and the Saudi market expect and what Google requires for EEA traffic.
 * `ad_storage` is granted only after a real interaction — see `grantAdStorage`.
 * Setting defaults after the container loads is the common mistake: the tags
 * have already fired by then and the default never applied.
 */

/**
 * Both identifiers are read from **build-time** environment variables, with the
 * placeholder as a fallback so a fresh clone still builds.
 *
 * They are public values baked into the HTML, which is why they use the
 * `PUBLIC_` prefix and are set as *variables* rather than secrets. The
 * distinction matters on Cloudflare: this is a static site, so anything the
 * markup needs must exist when the build runs. A value added as a runtime
 * secret is invisible here and the placeholder ships instead — which is
 * exactly how the Turnstile test key survived being "configured".
 */

/** TODO(setup): set PUBLIC_GTM_ID in the Cloudflare build variables — see SETUP.md. */
export const GTM_ID = import.meta.env['PUBLIC_GTM_ID'] || 'GTM-XXXXXXX'

/** Turnstile site key. Public by design; the secret half lives in the Function. */
export const TURNSTILE_SITE_KEY =
  import.meta.env['PUBLIC_TURNSTILE_SITE_KEY'] || '1x00000000000000000000AA'

/** True once a real container ID is configured, so nothing loads with a stub. */
export const ANALYTICS_ENABLED = !GTM_ID.includes('XXXXXXX')

/**
 * True while the form is still showing Cloudflare's public test widget, which
 * passes every request including bots. Surfaced so the build can say so out
 * loud rather than letting it pass as working protection.
 */
export const TURNSTILE_IS_TEST_KEY = TURNSTILE_SITE_KEY.startsWith('1x000000')

// Said once per build, on the server only. A form that shows a green tick and
// checks nothing is worse than no form protection, because it looks solved.
if (import.meta.env.SSR && TURNSTILE_IS_TEST_KEY) {
  console.warn(
    '[psd] Turnstile is using the public TEST key: the widget passes everything, including bots.\n' +
      '      Set PUBLIC_TURNSTILE_SITE_KEY as a build variable in Cloudflare (not a runtime secret).',
  )
}

export type AnalyticsEvent =
  | 'form_submit'
  | 'form_start'
  | 'whatsapp_click'
  | 'phone_click'
  | 'language_switch'
  | 'scroll_75'

export interface AnalyticsPayload {
  event: AnalyticsEvent
  /** Path of the page the event happened on. */
  page: string
  /** 'en' | 'ar' — kept as a plain string so this module stays dependency-free. */
  language: string
  /** Free-form extras, e.g. which form or which CTA. */
  [key: string]: unknown
}

/**
 * The inline script that must run *before* GTM. Exported as a string so the
 * layout can emit it and the CSP can hash it.
 */
export const CONSENT_DEFAULT_SCRIPT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});
gtag('set', 'ads_data_redaction', true);
`.trim()
