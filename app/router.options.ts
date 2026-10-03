import type { RouterConfig } from '@nuxt/schema'
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (to.path === from.path) return false
    if (savedPosition) return savedPosition
    // Listing restores storage and scroll after its first hydrated render.
    if (to.name === 'journeys') return false
    if (to.hash) return { el: to.hash }
    return { top: 0, behavior: 'instant' }
  },
}
