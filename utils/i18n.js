import { useCookie, useState } from '#imports'
import messages from '../data/demoTranslations.json'
export const supportedLanguages = Object.freeze([
  { code: 'en', label: 'English' }, { code: 'ru', label: 'Русский' },
  { code: 'fr', label: 'Français' }, { code: 'de', label: 'Deutsch' },
])
export function useI18n() {
const preference = useCookie('thevtravel-language', { path: '/', sameSite: 'lax', maxAge: 31536000 })
const locale = useState('locale', () => supportedLanguages.some(language => language.code === preference.value) ? preference.value : 'en')
function setLocale(code) {
  if (!supportedLanguages.some(language => language.code === code)) return
  locale.value = code
  preference.value = code
  if (import.meta.client) {
    try { localStorage.setItem('thevtravel-language', code) } catch {}
    document.documentElement.lang = code
  }
}
// English keys are demo fallbacks. API records may supply { en, ru, fr, de } instead.
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
  if (duration) return `${duration[1] || ''}${duration[2]} ${messages.hours[locale.value]}`
  return value
}
return { locale, setLocale, translate }
}
