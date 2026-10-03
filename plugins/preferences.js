import { useI18n } from '~/utils/i18n'
export default defineNuxtPlugin(nuxtApp => {
  const { translate, setLocale } = useI18n()
  const { applyTheme } = useTheme()
  nuxtApp.vueApp.config.globalProperties.$t = translate
  // Legacy localStorage preferences are adopted after hydration. New cookies
  // let subsequent requests render matching language and theme server-side.
  if (import.meta.client) nuxtApp.hook('app:mounted', () => {
    try { const language = localStorage.getItem('thevtravel-language'); if (language) setLocale(language) } catch {}
    applyTheme(document.documentElement.dataset.theme)
  })
})
