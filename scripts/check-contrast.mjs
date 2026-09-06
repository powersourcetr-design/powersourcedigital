#!/usr/bin/env node
/**
 * Verifies WCAG 2.2 contrast for every semantic colour pair, in both themes.
 *
 * Reads the real token values out of src/styles/global.css and resolves
 * var() chains, so this checks what actually ships rather than a copy of the
 * palette that can drift.
 *
 * Thresholds: 4.5:1 for body text, 3:1 for large text and for UI boundaries
 * such as focus rings (WCAG 2.2 SC 1.4.11 Non-text Contrast).
 */

import { readFile } from 'node:fs/promises'

const CSS = await readFile('src/styles/global.css', 'utf8')

/** Strip comments so a hex inside a comment is never parsed as a token. */
const stripped = CSS.replace(/\/\*[\s\S]*?\*\//g, '')

/**
 * Collect declarations per scope. `:root` is light, `:root[data-theme='dark']`
 * is dark, and `@theme` holds the ramps both themes draw from.
 */
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
const light = collectBlock(/:root\s*\{([\s\S]*?)\n\}/)
const dark = collectBlock(/:root\[data-theme=["']dark["']\]\s*\{([\s\S]*?)\n\}/)

if (Object.keys(dark).length === 0) {
  console.error('✗ Could not find the dark theme block in global.css')
  process.exit(1)
}

/** Resolve a token through any number of var() indirections to a hex value. */
function resolve(name, scope, seen = new Set()) {
  if (seen.has(name)) throw new Error(`Circular token reference at ${name}`)
  seen.add(name)

  const raw = scope[name] ?? ramps[name]
  if (!raw) throw new Error(`Unknown token ${name}`)

  const varMatch = raw.match(/^var\(\s*(--[\w-]+)\s*\)$/)
  if (varMatch) return resolve(varMatch[1], scope, seen)

  const hex = raw.match(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i)
  if (!hex) throw new Error(`Token ${name} is not a plain hex value: "${raw}"`)
  return raw
}

function toRgb(hex) {
  const h = hex.slice(1)
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h
  return [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16))
}

/** WCAG relative luminance. */
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
  ['--text-default', '--surface-sunken', 4.5, 'body text on sunken surface'],
  ['--text-strong', '--surface', 4.5, 'headings on page background'],
  ['--text-strong', '--surface-raised', 4.5, 'headings on raised surface'],
  ['--text-muted', '--surface', 4.5, 'muted text on page background'],
  ['--text-muted', '--surface-raised', 4.5, 'muted text on raised surface'],
  ['--accent', '--surface', 4.5, 'link text on page background'],
  ['--accent', '--surface-raised', 4.5, 'link text on raised surface'],
  ['--accent-contrast', '--accent', 4.5, 'button label on accent fill'],
  ['--accent-hover', '--surface', 4.5, 'link hover on page background'],
  ['--accent', '--surface', 3, 'focus ring against page background'],
  ['--accent', '--surface-raised', 3, 'focus ring against raised surface'],
  // SC 1.4.11 applies to boundaries that identify a control, not to decorative
  // hairlines, so `--border-subtle` is deliberately not tested at 3:1.
  ['--border-interactive', '--surface', 3, 'input border against page background'],
  ['--border-interactive', '--surface-raised', 3, 'input border on raised surface'],
]

const THEMES = [
  ['light', light],
  ['dark', dark],
]

let failures = 0
const rows = []

for (const [themeName, scope] of THEMES) {
  for (const [fg, bg, min, label] of PAIRS) {
    const fgHex = resolve(fg, scope)
    const bgHex = resolve(bg, scope)
    const value = ratio(fgHex, bgHex)
    const pass = value >= min
    if (!pass) failures++
    rows.push({
      theme: themeName,
      label,
      fgHex,
      bgHex,
      value: value.toFixed(2),
      min,
      pass,
    })
  }
}

const width = Math.max(...rows.map((r) => r.label.length))
let currentTheme = ''
for (const r of rows) {
  if (r.theme !== currentTheme) {
    currentTheme = r.theme
    console.log(`\n  ${currentTheme.toUpperCase()}`)
  }
  const mark = r.pass ? '✓' : '✗'
  console.log(
    `  ${mark} ${r.label.padEnd(width)}  ${r.fgHex} on ${r.bgHex}  ` +
      `${r.value.padStart(6)}:1  (needs ${r.min}:1)`,
  )
}

if (failures > 0) {
  console.error(`\n✗ ${failures} contrast failure(s). Adjust the tokens in global.css.\n`)
  process.exit(1)
}

console.log(`\n✓ All ${rows.length} colour pairs meet WCAG 2.2 AA in both themes.\n`)
