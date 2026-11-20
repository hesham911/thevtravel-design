import { createError, defineEventHandler, proxyRequest } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(event => {
  const config = useRuntimeConfig(event)
  const origin = config.crawlerBackendUrl || config.public.apiBaseUrl.replace(/\/api\/public\/?$/, '')
  if (!/^https?:\/\//.test(origin)) throw createError({ statusCode: 503, statusMessage: 'Crawler backend is not configured' })
  return proxyRequest(event, `${origin.replace(/\/$/, '')}/seo/robots`, { fetchOptions: { redirect: 'error' } })
})
