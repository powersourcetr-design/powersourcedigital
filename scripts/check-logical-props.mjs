#!/usr/bin/env node
/**
 * Fails the build if a physical direction utility or CSS property appears in
 * component or layout source. Everything must be logical (ms/me/ps/pe/start/end)
 * so a single stylesheet serves both LTR and RTL.
 *
 * Exceptions are narrow and explicit: `[dir='rtl']` mirror rules in global.css
 * legitimately use transforms, and this check does not scan that file.
 */

import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

const ROOTS = ['src/components', 'src/layouts', 'src/pages']
const EXTENSIONS = new Set(['.astro', '.ts', '.tsx', '.css'])

/** Tailwind utilities that bake in a physical direction. */
const TAILWIND = String.raw`\b-?(ml|mr|pl|pr|left|right|border-l|border-r|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br|text-left|text-right|float-left|float-right|inset-l|inset-r|origin-left|origin-right)(-[a-z0-9./[\]%-]+)?\b`

/** Raw CSS properties with the same problem. */
const CSS = String.raw`(?<![-\w])(margin|padding|border)-(left|right)\s*:|(?<![-\w])(left|right)\s*:\s*(?!auto\s*;?\s*\/\*\s*ok)`

const patterns = [
  { name: 'physical Tailwind utility', re: new RegExp(TAILWIND, 'g') },
  { name: 'physical CSS property', re: new RegExp(CSS, 'g') },
]

async function* walk(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else if (EXTENSIONS.has(extname(entry.name))) yield full
  }
}

const violations = []

for (const root of ROOTS) {
  for await (const file of walk(root)) {
    const source = await readFile(file, 'utf8')
    const lines = source.split('\n')

    lines.forEach((line, index) => {
      // Allow an explicit opt-out for the rare genuinely-physical case.
      if (line.includes('dir-ok')) return

      for (const { name, re } of patterns) {
        re.lastIndex = 0
        const match = re.exec(line)
        if (match) {
          violations.push({
            file: relative(process.cwd(), file),
            line: index + 1,
            name,
            text: match[0].trim(),
            source: line.trim(),
          })
        }
      }
    })
  }
}

if (violations.length > 0) {
  console.error(`\n✗ ${violations.length} physical-direction violation(s):\n`)
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  ${v.name} → "${v.text}"`)
    console.error(`    ${v.source}\n`)
  }
  console.error('Use logical properties: ms-/me-/ps-/pe-/start-/end-/text-start/border-s.')
  console.error('For a genuinely physical case, add a "dir-ok" comment on the line.\n')
  process.exit(1)
}

console.log('✓ No physical-direction utilities in components, layouts or pages.')
