import { computed, readonly } from 'vue'
import { useState, useCookie } from '#imports'
export function useTheme() {
  const preference = useCookie('thevtravel-theme', { path: '/', sameSite: 'lax', maxAge: 31536000 })
  const theme = useState('theme', () => preference.value === 'dark' ? 'dark' : 'light')
  const isDark = computed(() => theme.value === 'dark')
  function applyTheme(value, persist = false) {
    theme.value = value === 'dark' ? 'dark' : 'light'
    preference.value = theme.value
    if (import.meta.client) {
      document.documentElement.dataset.theme = theme.value
      document.documentElement.style.colorScheme = theme.value
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark.value ? '#001122' : '#faf6f2')
      if (persist) { try { localStorage.setItem('thevtravel-theme', theme.value) } catch {} }
    }
  }
  function toggleTheme() { applyTheme(isDark.value ? 'light' : 'dark', true) }
  return { theme: readonly(theme), isDark, toggleTheme, applyTheme }
}
