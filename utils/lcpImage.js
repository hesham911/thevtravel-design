import images from '~/data/lcpImages.json'

// Future CMS images retain their source until matching optimized assets exist.
export function lcpImage(src) {
  return images[src] || { src }
}
