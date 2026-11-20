import approvedImages from '../data/approvedContentImages.json' with { type: 'json' }

const legacySeeds = {
  'about-people': ['people-team.webp', 14184],
  'home-hero': ['home-felucca.webp', 140920],
  'transfer-banner': ['hero-transfer-van.webp', 40420],
}

// Recognize shipped seed media only. An editor's own upload always wins.
export function contentImage(media, name, locale = 'en') {
  const image = approvedImages[name]
  const full = image.variants.at(-1)
  const legacy = legacySeeds[name]
  const isSeed = !media?.url
    || (media.file_name === `approved-${name}.webp` && media.size === full.bytes)
    || (legacy && media.file_name === legacy[0] && media.size === legacy[1])
  if (!isSeed) return { url: media.url, width: null, height: null, srcset: null, mobile: null, alt: null }
  return {
    url: full.src, alt: image.alt[locale] || image.alt.en, width: full.width, height: full.height,
    srcset: image.variants.map(variant => `${variant.src} ${variant.width}w`).join(', '),
    mobile: image.variants[0].src,
  }
}

export function heroImageStyle(photo) {
  const desktop = `url(${JSON.stringify(photo.url)})`
  const mobile = photo.mobile ? `image-set(url(${JSON.stringify(photo.mobile)}) 1x, ${desktop} 2x)` : desktop
  return { '--hero-image': desktop, '--hero-mobile-image': mobile }
}

export function heroImagePreloads(photo) {
  if (!photo.mobile) return [{ key: 'page-hero-preload', rel: 'preload', as: 'image', href: photo.url, fetchpriority: 'high' }]
  return [
    { key: 'page-hero-mobile', rel: 'preload', as: 'image', href: photo.mobile, imagesrcset: `${photo.mobile} 1x, ${photo.url} 2x`, media: '(max-width: 767px)', fetchpriority: 'high' },
    { key: 'page-hero-desktop', rel: 'preload', as: 'image', href: photo.url, media: '(min-width: 768px)', fetchpriority: 'high' },
  ]
}
