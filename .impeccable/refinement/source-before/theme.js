import { computed, readonly, ref } from 'vue'

const STORAGE_KEY = 'thevtravel-theme'
const theme = ref(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

function applyTheme(value, { persist = false } = {}) {
  const nextTheme = value === 'dark' ? 'dark' : 'light'
  theme.value = nextTheme
  document.documentElement.dataset.theme = nextTheme
  document.documentElement.style.colorScheme = nextTheme

  const themeColor = document.querySelector('meta[name="theme-color"]')
  themeColor?.setAttribute('content', nextTheme === 'dark' ? '#001122' : '#faf6f2')

  if (persist) localStorage.setItem(STORAGE_KEY, nextTheme)
}

export function initializeTheme() {
  applyTheme(document.documentElement.dataset.theme)
}

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark')

  function toggleTheme() {
    applyTheme(isDark.value ? 'light' : 'dark', { persist: true })
  }

  return { theme: readonly(theme), isDark, toggleTheme }
}
