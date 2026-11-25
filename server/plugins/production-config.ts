export default defineNitroPlugin(() => {
  if (process.env.NODE_ENV !== 'production') return
  const config = useRuntimeConfig()
  for (const [name, value] of Object.entries({ NUXT_PUBLIC_API_BASE_URL: config.public.apiBaseUrl, NUXT_PUBLIC_SITE_URL: config.public.siteUrl })) {
    if (!value || !/^https?:\/\//.test(String(value))) {
      throw new Error(`${name} must be explicitly configured; production demo fallback is disabled.`)
    }
  }
})
