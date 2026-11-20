import { computed } from 'vue'
import { useCookie, useRoute, useRouter } from '#imports'
import { localeFromPath, localizePath } from './localizedRoutes'
import messages from '../data/demoTranslations.json'
// URL locale is authoritative; stored preferences never choose SSR language.
export const supportedLanguages = Object.freeze([
  { code: 'en', label: 'English' }, { code: 'ru', label: 'Русский' },
  { code: 'fr', label: 'Français' }, { code: 'de', label: 'Deutsch' },
  { code: 'zh', label: '中文' }, { code: 'uk', label: 'Українська' },
])
export function useI18n() {
const preference = useCookie('thevtravel-language', { path: '/', sameSite: 'lax', maxAge: 31536000 })
const route = useRoute()
const router = useRouter()
const locale = computed(() => route.meta.localizedPublic
  ? localeFromPath(route.path)
  : supportedLanguages.some(language => language.code === preference.value) ? preference.value : 'en')
async function setLocale(code) {
  if (!supportedLanguages.some(language => language.code === code)) return
  const destination = localizePath(route.fullPath, code)
  if (destination !== route.fullPath) await router.push(destination)
  preference.value = code
  if (import.meta.client) {
    try { localStorage.setItem('thevtravel-language', code) } catch {}
  }
}
// English keys are demo fallbacks. API records may supply { en, ru, fr, de, zh, uk } instead.
// Pages still on demo copy fall back to English in a language the table lacks.
function translate(value, parameters) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return value[locale.value] || value.en || ''
  if (typeof value !== 'string') return value
  if (parameters) {
    const template = locale.value === 'en' ? value : messages[value]?.[locale.value] || value
    return template.replace(/\{(\w+)\}/g, (_, name) => parameters[name] ?? '')
  }
  if (locale.value === 'en') return value
  const key = value.trim().replace(/\s+/g, ' ')
  const translated = messages[key]?.[locale.value]
  if (translated) return translated
  // Composite metadata and accessible labels retain their dynamic data.
  const duration = key.match(/^(~\s*)?([\d–−.,]+)\s+hours$/)
  if (duration) return `${duration[1] || ''}${duration[2]} ${messages.hours[locale.value] || 'hours'}`
  return value
}
return { locale, setLocale, translate }
}
