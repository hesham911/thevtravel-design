<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import AppIcon from './AppIcon.vue'
import { useI18n, supportedLanguages } from '~/utils/i18n'
const { locale, setLocale } = useI18n()
const id = useId()
const container = ref(null), trigger = ref(null), open = ref(false)
const activeIndex = ref(0)
const selectedIndex = computed(() => supportedLanguages.findIndex(language => language.code === locale.value))
async function focusOption(index) {
  activeIndex.value = (index + supportedLanguages.length) % supportedLanguages.length
  await nextTick()
  container.value?.querySelectorAll('[role="option"]')[activeIndex.value]?.focus()
}
async function show() { open.value = true; await focusOption(selectedIndex.value) }
function close(restoreFocus = false) { open.value = false; if (restoreFocus) trigger.value?.focus() }
function toggle() { if (open.value) close(); else show() }
function choose(code) { setLocale(code); close(true) }
function keys(event) {
  if (event.key === 'Escape' && open.value) { event.preventDefault(); event.stopPropagation(); close(true) }
  else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    event.preventDefault()
    if (!open.value) { show(); return }
    focusOption(event.key === 'Home' ? 0 : event.key === 'End' ? supportedLanguages.length - 1 : activeIndex.value + (event.key === 'ArrowDown' ? 1 : -1))
  }
}
function outside(event) { if (!container.value?.contains(event.target)) close() }
function focusLeft(event) { if (!container.value?.contains(event.relatedTarget)) close() }
onMounted(() => document.addEventListener('pointerdown', outside))
onBeforeUnmount(() => document.removeEventListener('pointerdown', outside))
</script>
<template>
  <div ref="container" class="header-language language-selector" @keydown="keys" @focusout="focusLeft">
    <button ref="trigger" class="language-trigger" type="button" aria-haspopup="listbox" :aria-expanded="open" :aria-controls="`${id}-languages`" :aria-label="`${$t('Select language')}: ${supportedLanguages[selectedIndex].label}`" @click="toggle">
      <AppIcon name="globe" :size="18" /><span>{{ locale.toUpperCase() }}</span><AppIcon name="chevron-down" :size="13" />
    </button>
    <ul v-if="open" :id="`${id}-languages`" class="language-dropdown" role="listbox" :aria-label="$t('Select language')">
      <li v-for="(language, index) in supportedLanguages" :key="language.code" role="none">
        <button type="button" role="option" :aria-selected="locale === language.code" :tabindex="index === activeIndex ? 0 : -1" @focus="activeIndex = index" @click="choose(language.code)">
          <span class="language-code">{{ language.code.toUpperCase() }}</span><span>{{ language.label }}</span><AppIcon v-if="locale === language.code" name="check" :size="16" />
        </button>
      </li>
    </ul>
  </div>
</template>
