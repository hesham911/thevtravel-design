// Run with Sharp available through NODE_PATH (see README.md).
const sharp = require('sharp')
const fs = require('node:fs')
const crypto = require('node:crypto')

async function main() {
  const { journeyDetails } = await import('../data/journeyDetails.js')
  const sources = new Set([
    '/assets/photos/home-hero-clean.png',
    '/assets/photos/how-booking-hero-light.png',
    '/assets/photos/how-booking-hero-dark.png',
    ...Object.values(journeyDetails).map(journey => journey.image.src),
  ])
  const manifest = {}
  const inventory = []
  const verification = []
  fs.mkdirSync('public/assets/lcp', { recursive: true })
  for (const source of sources) {
    const input = fs.readFileSync('public' + source)
    const metadata = await sharp(input).metadata()
    // No resize or lossy encoding: retain every source pixel and existing crop.
    const output = await sharp(input).webp({ lossless: true, effort: 6 }).toBuffer()
    const originalPixels = await sharp(input).ensureAlpha().raw().toBuffer()
    const optimizedPixels = await sharp(output).ensureAlpha().raw().toBuffer()
    if (!originalPixels.equals(optimizedPixels)) throw new Error(`${source}: lossless pixel verification failed`)
    const hash = crypto.createHash('sha256').update(output).digest('hex').slice(0, 12)
    const name = source.split('/').at(-1).replace(/\.[^.]+$/, '')
    const src = `/assets/lcp/${name}.${hash}.webp`
    fs.writeFileSync('public' + src, output)
    verification.push({ source, optimized: src, identicalDecodedPixels: true })
    manifest[source] = { src, width: metadata.width, height: metadata.height, bytes: output.length }
    inventory.push({ src: source, width: metadata.width, height: metadata.height, format: metadata.format, bytes: input.length })
  }
  // Sync only the existing Home/listing selectors; leave other pages alone.
  let css = fs.readFileSync('assets/css/styles.css', 'utf8')
  for (const [source, asset] of Object.entries(manifest)) {
    if (!/home-hero-clean|how-booking-hero/.test(source)) continue
    const name = source.split('/').at(-1).replace('.png', '')
    const optimizedPattern = new RegExp(`/assets/lcp/${name}\\.[a-f0-9]+\\.webp`, 'g')
    css = css.replace(optimizedPattern, asset.src)
  }
  fs.writeFileSync('assets/css/styles.css', css)
  fs.writeFileSync('data/lcpImages.json', JSON.stringify(manifest, null, 2) + '\n')
  fs.writeFileSync('artifacts/lcp-image-inventory.json', JSON.stringify(inventory, null, 2) + '\n')
  fs.writeFileSync('artifacts/lcp-lossless-verification.json', JSON.stringify(verification, null, 2) + '\n')
  console.log(`Generated ${sources.size} lossless images without resizing.`)
}
main().catch(error => { console.error(error); process.exitCode = 1 })
