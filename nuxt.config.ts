export default defineNuxtConfig({
  compatibilityDate: '2026-10-03',
  srcDir: '.',
  ssr: true,
  devtools: { enabled: false },
  css: ['~/assets/css/styles.css', '~/assets/css/journey-details.css', '~/assets/css/refinements.css', '~/assets/css/typography.css', '~/assets/css/legal.css'],
  nitro: { compressPublicAssets: true },
  experimental: { defaults: { nuxtLink: { prefetchOn: { interaction: true, visibility: false } } } },
  hooks: {
    'build:manifest': (manifest) => {
      // Do not fetch unmounted async components (including the map engine).
      // Required static imports still receive modulepreload hints.
      for (const entry of Object.values(manifest)) entry.prefetch = false
    },
  },
  routeRules: {
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/assets/lcp/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    // Existing public filenames are mutable: retain revalidation after one day.
    '/assets/**': { headers: { 'cache-control': 'public, max-age=86400' } },
  },
  runtimeConfig: { public: { whatsappUrl: '', locationApiUrl: '', apiBaseUrl: '', siteUrl: '', mapStyleUrl: 'https://tiles.openfreemap.org/styles/liberty' } },
  app: { head: { htmlAttrs: { lang: 'en' }, link: [{ rel: 'icon', href: '/assets/icons/favicon.svg' }] } },
})
