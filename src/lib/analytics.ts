/**
 * Every tracking identifier lives here. Swap the GTM container in one place.
 *
 * Consent Mode is set to *denied* by default before GTM loads, which is what
 * PDPL and the Saudi market expect and what Google requires for EEA traffic.
 * `ad_storage` is granted only after a real interaction — see `grantAdStorage`.
 * Setting defaults after the container loads is the common mistake: the tags
 * have already fired by then and the default never applied.
 */

/** TODO(setup): replace with the real container ID — see SETUP.md. */
export const GTM_ID = 'GTM-XXXXXXX'

/** Turnstile site key. Public by design; the secret lives in the Function. */
export const TURNSTILE_SITE_KEY = '1x00000000000000000000AA'

/** True once a real container ID is configured, so nothing loads with a stub. */
export const ANALYTICS_ENABLED = !GTM_ID.includes('XXXXXXX')

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
