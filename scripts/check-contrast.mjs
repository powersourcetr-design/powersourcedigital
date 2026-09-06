#!/usr/bin/env node
/**
 * Verifies WCAG 2.2 contrast for every semantic colour pair.
 *
 * Reads the real token values out of src/styles/global.css and resolves
 * var() chains, so this checks what actually ships rather than a copy of the
 * palette that can drift.
 *
 * The site has one designed theme — light — so there is one set of pairs.
 *
 * Thresholds: 4.5:1 for body text, 3:1 for large text and for UI boundaries
 * that identify a control (WCAG 2.2 SC 1.4.11 Non-text Contrast). Decorative
 * hairlines are deliberately not tested — 1.4.11 does not govern them, and
 * holding them to 3:1 would wreck the visual language for no accessibility gain.
 */

import { readFile } from 'node:fs/promises'

const CSS = await readFile('src/styles/global.css', 'utf8')

/** Strip comments so a hex inside a comment is never parsed as a token. */
const stripped = CSS.replace(/\/\*[\s\S]*?\*\//g, '')

function collectBlock(pattern) {
  const match = stripped.match(pattern)
  if (!match) return {}
  const out = {}
  for (const [, name, value] of match[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out[name] = value.trim()
  }
  return out
}

const ramps = collectBlock(/@theme\s*\{([\s\S]*?)\n\}/)
const theme = collectBlock(/:root\s*\{([\s\S]*?)\n\}/)

if (Object.keys(theme).length === 0) {
  console.error('✗ Could not find the :root token block in global.css')
  process.exit(1)
}

/**
 * Resolve a token to a hex value through any number of var() indirections.
 * `color-mix()` is resolved by compositing over the page surface, which is what
 * the browser does for these translucent border tokens.
 */
function resolve(name, seen = new Set()) {
  if (seen.has(name)) throw new Error(`Circular token reference at ${name}`)
  seen.add(name)

  const raw = theme[name] ?? ramps[name]
  if (!raw) throw new Error(`Unknown token ${name}`)

  const varMatch = raw.match(/^var\(\s*(--[\w-]+)\s*\)$/)
  if (varMatch) return resolve(varMatch[1], seen)

  const mix = raw.match(
    /^color-mix\(\s*in srgb\s*,\s*var\(\s*(--[\w-]+)\s*\)\s+(\d+)%\s*,\s*transparent\s*\)$/,
  )
  if (mix) {
    const base = toRgb(resolve(mix[1], new Set(seen)))
    const over = toRgb(resolve('--surface', new Set()))
    const alpha = Number(mix[2]) / 100
    const composited = base.map((c, i) => Math.round(c * alpha + over[i] * (1 - alpha)))
    return `#${composited.map((c) => c.toString(16).padStart(2, '0')).join('')}`
  }

  if (!/^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(raw)) {
    throw new Error(`Token ${name} is not a resolvable colour: "${raw}"`)
  }
  return raw
}

function toRgb(hex) {
  const h = hex.slice(1)
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h
  return [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16))
}

function luminance(hex) {
  const [r, g, b] = toRgb(hex).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** [foreground, background, minimum, description] */
const PAIRS = [
  ['--text-default', '--surface', 4.5, 'body text on page background'],
  ['--text-default', '--surface-raised', 4.5, 'body text on raised surface'],
  ['--text-strong', '--surface', 4.5, 'headings on page background'],
  ['--text-strong', '--surface-raised', 4.5, 'headings on raised surface'],
  ['--text-muted', '--surface', 4.5, 'muted text on page background'],
  ['--text-muted', '--surface-raised', 4.5, 'muted text on raised surface'],
  ['--accent', '--surface', 4.5, 'link text on page background'],
  ['--accent', '--surface-raised', 4.5, 'link text on raised surface'],
  ['--accent-hover', '--surface', 4.5, 'link hover on page background'],
  ['--accent-contrast', '--accent', 4.5, 'button label on accent fill'],
  ['--accent-vivid', '--surface', 3, 'vivid accent as a large graphic element'],
  ['--text-invert', '--surface-invert', 4.5, 'text on the dark CTA panel'],
  ['--danger', '--surface', 4.5, 'error text'],
  ['--warning', '--surface', 4.5, 'warning text'],
  ['--accent', '--surface', 3, 'focus ring against page background'],
  ['--accent', '--surface-raised', 3, 'focus ring against raised surface'],
  ['--border-interactive', '--surface', 3, 'input border against page background'],
  ['--border-interactive', '--surface-raised', 3, 'input border on raised surface'],
]

let failures = 0
const rows = PAIRS.map(([fg, bg, min, label]) => {
  const fgHex = resolve(fg)
  const bgHex = resolve(bg)
  const value = ratio(fgHex, bgHex)
  const pass = value >= min
  if (!pass) failures++
  return { label, fgHex, bgHex, value: value.toFixed(2), min, pass }
})

const width = Math.max(...rows.map((r) => r.label.length))
console.log('')
for (const r of rows) {
  console.log(
    `  ${r.pass ? '✓' : '✗'} ${r.label.padEnd(width)}  ${r.fgHex} on ${r.bgHex}  ` +
      `${r.value.padStart(6)}:1  (needs ${r.min}:1)`,
  )
}

if (failures > 0) {
  console.error(`\n✗ ${failures} contrast failure(s). Adjust the tokens in global.css.\n`)
  process.exit(1)
}

console.log(`\n✓ All ${rows.length} colour pairs meet WCAG 2.2 AA.\n`)
