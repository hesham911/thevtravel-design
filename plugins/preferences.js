import { useI18n } from '~/utils/i18n'
export default defineNuxtPlugin(nuxtApp => {
  const { translate } = useI18n()
  const { applyTheme } = useTheme()
  nuxtApp.vueApp.config.globalProperties.$t = translate
  // Theme preferences are applied after hydration. Language comes from the URL.
  if (import.meta.client) nuxtApp.hook('app:mounted', () => {
    applyTheme(document.documentElement.dataset.theme)
  })
})
