#!/usr/bin/env node
/**
 * Builds the portfolio share image, 1200x630, into public/og/.
 *
 * Composed from three real project thumbnails on the site's own white
 * background rather than a stock graphic, because the share card should show
 * the same thing the page does. Generated at build time from the committed
 * screenshots, so it cannot drift from the portfolio it advertises.
 *
 * Written as a build step next to build-redirects.mjs rather than as an Astro
 * integration: it produces a static file from static inputs and has no reason
 * to run inside the page pipeline.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const WIDTH = 1200
const HEIGHT = 630

/** The three that read most clearly at card size. */
const SHOTS = ['cooliva', 'indeco', 'sparx']

const CARD = { width: 320, height: 200, gap: 32, top: 300 }
const BORDER = '#e6e9ef'
const BACKGROUND = '#ffffff'

const cards = await Promise.all(
  SHOTS.map(async (slug) => {
    const image = await sharp(join('src', 'assets', 'portfolio', slug, 'thumb.jpg'))
      .resize(CARD.width, CARD.height, { fit: 'cover', position: 'top' })
      // A hairline border so a light screenshot does not dissolve into the
      // white background of the card.
      .extend({ top: 1, bottom: 1, left: 1, right: 1, background: BORDER })
      .toBuffer()
    return image
  }),
)

const totalWidth = SHOTS.length * (CARD.width + 2) + (SHOTS.length - 1) * CARD.gap
const startLeft = Math.round((WIDTH - totalWidth) / 2)

const logo = await sharp(join('src', 'assets', 'pst-logo.png'))
  .resize({ width: 240 })
  .toBuffer()
const logoMeta = await sharp(logo).metadata()

const composites = [
  { input: logo, left: Math.round((WIDTH - 240) / 2), top: 120 },
  ...cards.map((input, index) => ({
    input,
    left: startLeft + index * (CARD.width + 2 + CARD.gap),
    top: CARD.top,
  })),
]

const out = join('public', 'og')
await mkdir(out, { recursive: true })

const buffer = await sharp({
  create: { width: WIDTH, height: HEIGHT, channels: 3, background: BACKGROUND },
})
  .composite(composites)
  .jpeg({ quality: 86, progressive: true })
  .toBuffer()

await writeFile(join(out, 'portfolio.jpg'), buffer)

console.log(
  `✓ og/portfolio.jpg — ${WIDTH}x${HEIGHT}, ${SHOTS.length} thumbs, logo ${logoMeta.width}x${logoMeta.height}, ${Math.round(buffer.length / 1024)}kB`,
)
