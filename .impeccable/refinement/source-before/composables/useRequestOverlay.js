import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
const activeRequests = ref(0)
export const requestOverlayOpen = computed(() => activeRequests.value > 0)
export function useRequestOverlay(dialog, changed = () => {}) {
  let previousFocus, previousOverflow, locked = false
  function unlock() {
    if (!locked) return
    document.body.style.overflow = previousOverflow
    locked = false
    activeRequests.value--
    changed(false)
  }
  async function openOverlay() {
    if (locked) return
    previousFocus = document.activeElement
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    locked = true
    activeRequests.value++
    changed(true)
    await nextTick()
    dialog.value.showModal()
  }
  function closeOverlay() { dialog.value?.close() }
  async function overlayClosed() {
    unlock()
    await nextTick()
    const label = previousFocus?.getAttribute?.('aria-label')
    const target = previousFocus?.isConnected ? previousFocus : [...document.querySelectorAll('[aria-label]')].find(el => label && el.getAttribute('aria-label') === label)
    target?.focus?.({ preventScroll: true })
  }
  onBeforeUnmount(unlock)
  return { openOverlay, closeOverlay, overlayClosed }
}
