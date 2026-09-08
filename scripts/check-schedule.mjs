#!/usr/bin/env node
/**
 * Fails if a post links to another post that publishes later than it does, or
 * to one in the other language.
 *
 * Both mistakes are invisible until they detonate. Posts are dated forward and
 * only built once their date arrives, so a post that links to a later one
 * resolves fine today — against a dist/ containing everything already
 * published — and breaks the build on the morning it goes live. That build is
 * the unattended 4am one that releases the day's post, so the failure surfaces
 * as "the blog stopped updating" a week later.
 *
 * The cross-language case is the same shape: `route:` links resolve in the
 * locale of the file they sit in, so an English post linking to an Arabic slug
 * silently builds `/blog/<arabic-slug>/`, which never exists.
 *
 * Checked against the source rather than dist/, because the whole point is to
 * catch links to posts that dist/ does not contain yet.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'

const BLOG = join('src', 'content', 'blog')
const LOCALES = ['en', 'ar']

/** Minimal front-matter read: only the two fields this check needs. */
function parse(path) {
  const text = readFileSync(path, 'utf8')
  const end = text.indexOf('\n---', 4)
  const frontMatter = text.slice(0, end === -1 ? text.length : end)

  const published = /^publishedAt:\s*(\d{4}-\d{2}-\d{2})/m.exec(frontMatter)?.[1]
  const draft = /^draft:\s*true\s*$/m.test(frontMatter)

  return { published, draft, body: end === -1 ? '' : text.slice(end) }
}

const posts = new Map()

for (const locale of LOCALES) {
  const dir = join(BLOG, locale)
  for (const file of readdirSync(dir).filter((name) => name.endsWith('.md'))) {
    const slug = basename(file, '.md')
    const { published, draft, body } = parse(join(dir, file))
    posts.set(`${locale}/${slug}`, { locale, slug, published, draft, body })
  }
}

const problems = []

for (const [id, post] of posts) {
  if (post.draft) continue

  for (const match of post.body.matchAll(/\]\(route:blogPost\/([^)]+)\)/g)) {
    const target = match[1]
    const sameLocale = posts.get(`${post.locale}/${target}`)

    if (!sameLocale) {
      const elsewhere = LOCALES.filter((l) => posts.has(`${l}/${target}`))
      problems.push(
        elsewhere.length > 0
          ? `${id} links to "${target}", which only exists in ${elsewhere.join('/')}. ` +
              'route: links resolve in the locale of the file they sit in.'
          : `${id} links to "${target}", which is not a post.`,
      )
      continue
    }

    if (sameLocale.draft) {
      problems.push(`${id} links to "${target}", which is still a draft.`)
      continue
    }

    if (sameLocale.published > post.published) {
      problems.push(
        `${id} (${post.published}) links forward to "${target}" (${sameLocale.published}). ` +
          'That link is dead until the target publishes, and fails the build that day.',
      )
    }
  }
}

if (problems.length > 0) {
  console.error(`\n✗ ${problems.length} scheduling problem(s) in blog links:\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  console.error('\nA post may only link to posts published on or before its own date.\n')
  process.exit(1)
}

console.log(`✓ ${posts.size} posts: no forward or cross-language links.`)
