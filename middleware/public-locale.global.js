import { localizePath, isPublicPath } from '~/utils/localizedRoutes'

export default defineNuxtRouteMiddleware(to => {
  if (/^\/ar(?:\/|$)/.test(to.path) && isPublicPath(to.path)) {
    return navigateTo(localizePath(to.fullPath, 'en'), { redirectCode: 301 })
  }
  if (to.meta.localizedPublic && !to.params.locale) {
    return navigateTo(localizePath(to.fullPath, 'en'), { redirectCode: 301 })
  }
})
