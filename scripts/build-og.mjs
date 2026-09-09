#!/usr/bin/env node
/**
 * Builds the portfolio share image, 1200x630, into public/og/.
 *
 * Composed from three real project thumbnails on the site's own white
 * background rather than a stock graphic, because the share card should show
 * the same thing the page does. Generated at build time from the committed
 * screenshots and from the same portfolio.json the page renders, so the count
 * on the card cannot drift from the count on the page.
 *
 * The mark never appears on its own here. On the site it is always locked up
 * with the Power Source Digital wordmark, and a share card is the one place
 * that lockup is most likely to be seen with no surrounding context at all —
 * so the wordmark travels with it.
 *
 * Written as a build step next to build-redirects.mjs rather than as an Astro
 * integration: it produces a static file from static inputs and has no reason
 * to run inside the page pipeline.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const WIDTH = 1200
const HEIGHT = 630
const MARGIN = 72

/** Straight from global.css, so the card cannot drift from the site. */
const INK = '#0a0d14'
const MUTED = '#566890'
const ACCENT = '#006e3c'
const BORDER = '#e7eaef'
const WHITE = '#ffffff'

/** The three that read most clearly at card size. */
const SHOTS = ['cooliva', 'indeco', 'sparx']

const projects = JSON.parse(await readFile(join('src', 'data', 'portfolio.json'), 'utf8'))
const countries = new Set(projects.map((p) => p.country.en).filter(Boolean)).size

// Screenshots run off the bottom edge rather than floating in the middle: the
// card is a window onto the page, not a slide with three pictures on it.
const CARD = { width: 336, gap: 24, top: 372 }
const CARD_HEIGHT = HEIGHT - CARD.top

const cards = await Promise.all(
  SHOTS.map((slug) =>
    sharp(join('src', 'assets', 'portfolio', slug, 'thumb.jpg'))
      .resize(CARD.width, CARD_HEIGHT, { fit: 'cover', position: 'top' })
      .toBuffer(),
  ),
)

const mark = await sharp(join('src', 'assets', 'logo.png'))
  .resize({ height: 60 })
  .toBuffer()
const markWidth = (await sharp(mark).metadata()).width ?? 110

// Text is drawn as SVG so it uses the same weights and colours as the site
// rather than being baked into an image nobody can edit later.
const textLayer =
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <style>
    .word { font-family: 'Segoe UI', Arial, sans-serif; font-weight: 700; font-size: 27px; fill: ${INK}; }
    .sub  { font-family: 'Segoe UI', Arial, sans-serif; font-weight: 600; font-size: 15px; fill: ${ACCENT}; letter-spacing: 3.4px; }
    .head { font-family: 'Segoe UI', Arial, sans-serif; font-weight: 700; font-size: 62px; fill: ${INK}; }
    .lede { font-family: 'Segoe UI', Arial, sans-serif; font-weight: 400; font-size: 25px; fill: ${MUTED}; }
  </style>
  <text class="word" x="${MARGIN + markWidth + 18}" y="${MARGIN + 26}">Power Source</text>
  <text class="sub"  x="${MARGIN + markWidth + 20}" y="${MARGIN + 52}">DIGITAL</text>
  <text class="head" x="${MARGIN}" y="${MARGIN + 168}">Work that speaks for itself.</text>
  <text class="lede" x="${MARGIN}" y="${MARGIN + 214}">${projects.length} websites and online stores across ${countries} countries.</text>
</svg>`)

// A hairline above the row so a pale screenshot does not dissolve into the
// white it sits on.
const rule = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH - MARGIN * 2}" height="1"><rect width="100%" height="1" fill="${BORDER}"/></svg>`,
)

const out = join('public', 'og')
await mkdir(out, { recursive: true })

const buffer = await sharp({
  create: { width: WIDTH, height: HEIGHT, channels: 3, background: WHITE },
})
  .composite([
    { input: mark, left: MARGIN, top: MARGIN - 8 },
    { input: textLayer, left: 0, top: 0 },
    { input: rule, left: MARGIN, top: CARD.top - 28 },
    ...cards.map((input, index) => ({
      input,
      left: MARGIN + index * (CARD.width + CARD.gap),
      top: CARD.top,
    })),
  ])
  .jpeg({ quality: 88, progressive: true })
  .toBuffer()

await writeFile(join(out, 'portfolio.jpg'), buffer)

console.log(
  `✓ og/portfolio.jpg — ${WIDTH}x${HEIGHT}, ${projects.length} projects / ${countries} countries, ${Math.round(buffer.length / 1024)}kB`,
)
