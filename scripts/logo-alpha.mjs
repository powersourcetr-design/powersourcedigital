// Turns the white-background PST logo JPG into a trimmed transparent PNG.
//
// The source is a JPEG, so edges carry compression artefacts and a grey drop
// shadow. Alpha is derived from how close a pixel is to neutral white rather
// than from a hard threshold, which keeps the yellow S (bright but saturated)
// fully opaque while dissolving the white ground and the grey shadow.
import sharp from 'sharp'

const SRC = 'brand-source/psd-live-logo.jpg'
const OUT = 'src/assets/pst-logo.png'

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info
const out = Buffer.alloc(width * height * 4)

for (let i = 0, j = 0; i < data.length; i += channels, j += 4) {
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const saturation = max - min

  // Neutral (low saturation) and bright => background or shadow. Fade it out
  // over a band rather than cutting at one value, so edges stay smooth.
  let alpha = 255
  if (saturation < 34) {
    if (min >= 246) alpha = 0
    else if (min > 176) alpha = Math.round(255 * (1 - (min - 176) / (246 - 176)))
  }

  out[j] = r
  out[j + 1] = g
  out[j + 2] = b
  out[j + 3] = alpha
}

await sharp(out, { raw: { width, height, channels: 4 } })
  .trim({ threshold: 1 })
  .png({ compressionLevel: 9 })
  .toFile(OUT)

const meta = await sharp(OUT).metadata()
console.log(`wrote ${OUT} — ${meta.width}x${meta.height}, alpha: ${meta.hasAlpha}`)
