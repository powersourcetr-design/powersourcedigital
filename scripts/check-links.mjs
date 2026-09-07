#!/usr/bin/env node
/**
 * Crawls the built site and fails if any internal link points at a path that
 * was not built.
 *
 * This runs against `dist/` rather than the source, so it catches the failures
 * that source-level review misses: a route key that resolves to a path nobody
 * generated, an Arabic slug that drifted from its directory name, a nav item
 * added before its page. Every one of those ships as a 404 and looks fine in
 * code review.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const DIST = 'dist'

if (!existsSync(DIST)) {
  console.error('✗ No dist/ — run the build first.')
  process.exit(1)
}

function htmlFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...htmlFiles(full))
    else if (entry.name.endsWith('.html')) out.push(full)
  }
  return out
}

/** Arabic paths are percent-encoded in markup but land on disk decoded. */
function resolves(href) {
  const decoded = decodeURIComponent(href)
  return (
    existsSync(join(DIST, decoded, 'index.html')) ||
    existsSync(join(DIST, decoded)) ||
    existsSync(join(DIST, `${decoded.replace(/\/$/, '')}.html`))
  )
}

const broken = new Map()

for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8')
  for (const match of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = match[1]
    // Hashed assets are emitted by the bundler and always exist.
    if (href.startsWith('/_astro/')) continue
    if (resolves(href)) continue

    const sources = broken.get(href) ?? new Set()
    sources.add(relative(DIST, file))
    broken.set(href, sources)
  }
}

if (broken.size > 0) {
  console.error(`\n✗ ${broken.size} internal link(s) point at pages that were not built:\n`)
  for (const [href, sources] of broken) {
    console.error(`  ${decodeURIComponent(href)}`)
    for (const source of [...sources].slice(0, 4)) console.error(`    ← ${source}`)
  }
  console.error('\nEither build the page or remove the link (see LIVE_ROUTES in routes.ts).\n')
  process.exit(1)
}

/**
 * The same check for _redirects targets.
 *
 * A redirect whose destination was never built is worse than no redirect: the
 * crawler follows the 301, finds a 404, and the old URL's history is spent on
 * nothing. Page links were already checked above; these never were, and three
 * of them reached production.
 */
const REDIRECTS_FILE = join('public', '_redirects')

if (existsSync(REDIRECTS_FILE)) {
  const deadTargets = []

  for (const line of readFileSync(REDIRECTS_FILE, 'utf8').split('\n')) {
    const rule = line.trim()
    if (!rule || rule.startsWith('#')) continue

    const [from, to] = rule.split(/\s+/)
    if (!to) continue
    // The site root always exists; splat rules resolve at the edge, not on disk.
    if (to === '/' || to.includes('*')) continue
    if (resolves(to)) continue

    deadTargets.push([decodeURIComponent(from), decodeURIComponent(to)])
  }

  if (deadTargets.length > 0) {
    console.error(`\n✗ ${deadTargets.length} redirect(s) point at pages that were not built:\n`)
    for (const [from, to] of deadTargets) console.error(`  ${from}  →  ${to}`)
    console.error(
      '\nRetarget them at a page that exists, or drop the rule until it does.\n' +
        'A 301 into a 404 spends the old URL and returns nothing.\n',
    )
    process.exit(1)
  }
}

console.log('✓ Every internal link and redirect target resolves to a built page.')
