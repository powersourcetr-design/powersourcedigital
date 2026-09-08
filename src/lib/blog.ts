import { type CollectionEntry, getCollection } from 'astro:content'
import type { Locale } from '@/i18n/routes'

export type BlogEntry = CollectionEntry<'blog'>

/**
 * Posts for one locale, newest first.
 *
 * Unlike the services collection, a blog post is allowed to exist in one
 * language only — an article written for the Arabic market does not always
 * have an English counterpart worth writing. So there is no "every post must be
 * translated" assertion here; instead `translationOf()` returns null and the
 * page omits the hreflang pair rather than pointing at a URL that 404s.
 */
export async function getPosts(locale: Locale): Promise<BlogEntry[]> {
  const all = await getCollection(
    'blog',
    ({ data }) => !data.draft && isPublished(data.publishedAt),
  )
  return all
    .filter((entry) => entry.data.locale === locale)
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
}

/**
 * A post dated in the future has not been published yet.
 *
 * This is what makes a publishing schedule possible on a static site: posts are
 * written in batches, dated forward, and each appears on its own date the next
 * time the site builds. Filtering here rather than in the templates means a
 * future post is never *built* — so it cannot be reached by guessing the URL,
 * cannot appear in the sitemap, and cannot be indexed before its date.
 *
 * The comparison is against build time in UTC, because that is the clock
 * Cloudflare builds on. A date-only front-matter value parses as midnight UTC,
 * so a post dated today goes live at 03:00 Riyadh time.
 *
 * Nothing appears without a build. The daily rebuild is what turns a dated post
 * into a published one — see .github/workflows/publish-scheduled-posts.yml.
 */
export function isPublished(publishedAt: Date, now: Date = new Date()): boolean {
  return publishedAt.valueOf() <= now.valueOf()
}

/**
 * The same article in the other language, or null if it was never written —
 * or has not been published yet.
 *
 * The publish gate matters here as much as it does on the index. A translated
 * pair does not have to be scheduled for the same day, so between the two dates
 * one half exists and the other does not. Without this filter the published
 * half would advertise an hreflang alternate pointing at a page that was never
 * built, which is the one kind of broken link the crawler is actively told to
 * follow. It links up on its own when the twin's date arrives.
 */
export async function translationOf(entry: BlogEntry, target: Locale): Promise<BlogEntry | null> {
  const all = await getCollection(
    'blog',
    ({ data }) => !data.draft && isPublished(data.publishedAt),
  )
  return (
    all.find(
      (other) =>
        other.data.translationKey === entry.data.translationKey && other.data.locale === target,
    ) ?? null
  )
}

/**
 * Related posts, ranked by how many tags they share with the current post.
 *
 * Ties break towards the newer post, so a cluster that grows over time keeps
 * surfacing its most current article rather than whichever happens to sort
 * first alphabetically.
 */
export async function relatedPosts(entry: BlogEntry, limit = 3): Promise<BlogEntry[]> {
  const siblings = (await getPosts(entry.data.locale)).filter((other) => other.id !== entry.id)
  const tags = new Set(entry.data.tags)

  return siblings
    .map((other) => ({
      entry: other,
      shared: other.data.tags.filter((tag) => tags.has(tag)).length,
    }))
    .filter((candidate) => candidate.shared > 0)
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        b.entry.data.publishedAt.valueOf() - a.entry.data.publishedAt.valueOf(),
    )
    .slice(0, limit)
    .map((candidate) => candidate.entry)
}

/** The slug as authored — Arabic posts keep Arabic-script slugs. */
export function postSlug(entry: BlogEntry): string {
  return entry.id.replace(/^(en|ar)\//, '')
}
