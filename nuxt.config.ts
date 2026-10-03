export default defineNuxtConfig({
  compatibilityDate: '2026-10-03',
  srcDir: '.',
  ssr: true,
  devtools: { enabled: false },
  css: ['~/assets/css/styles.css', '~/assets/css/journey-details.css', '~/assets/css/refinements.css', '~/assets/css/typography.css', '~/assets/css/legal.css', 'leaflet/dist/leaflet.css', 'maplibre-gl/dist/maplibre-gl.css'],
  runtimeConfig: { public: { whatsappUrl: '', locationApiUrl: '', apiBaseUrl: '', siteUrl: '', mapStyleUrl: 'https://tiles.openfreemap.org/styles/liberty' } },
  app: { head: { htmlAttrs: { lang: 'en' }, link: [{ rel: 'icon', href: '/assets/icons/favicon.svg' }] } },
})
