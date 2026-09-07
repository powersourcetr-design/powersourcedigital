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
  const all = await getCollection('blog', ({ data }) => !data.draft)
  return all
    .filter((entry) => entry.data.locale === locale)
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
}

/** The same article in the other language, or null if it was never written. */
export async function translationOf(entry: BlogEntry, target: Locale): Promise<BlogEntry | null> {
  const all = await getCollection('blog', ({ data }) => !data.draft)
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
