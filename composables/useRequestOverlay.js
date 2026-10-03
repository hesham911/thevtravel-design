import { nextTick, onBeforeUnmount } from 'vue'
import { useState } from '#imports'
export function useOverlayState() { return useState('active-requests', () => 0) }
export function useRequestOverlay(dialog, changed = () => {}) {
  const activeRequests = useOverlayState()
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
