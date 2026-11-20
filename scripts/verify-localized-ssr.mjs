import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { once } from 'node:events'

const requests = []
const slug = `fixture-journey-${Date.now()}`
const site = 'https://thevtravel.com'
const api = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const url = new URL(req.url, 'http://localhost')
  const locale = url.searchParams.get('lang') || 'en'
  requests.push({ path: url.pathname, locale })
  const eligible = ['en', 'uk'].includes(locale)
  const alternatives = path => ['en', 'uk'].map(hreflang => ({ hreflang, url: `${site}/${hreflang}${path}` }))
  let data = { sections: [] }
  if (/\/pages\/[^/]+$/.test(url.pathname)) {
    const key = url.pathname.split('/').at(-1)
    const path = key === 'home' ? '' : key === 'about-us' ? '/about' : `/${key}`
    data = { meta_title: `CMS title ${locale}`, meta_description: `CMS description ${locale}`, canonical_url: `${site}/${eligible ? locale : 'en'}${path}`, robots: { index: eligible }, alternates: alternatives(path) }
  } else if (url.pathname === `/journeys/${slug}`) {
    data = { slug, title: `Journey ${locale}`, short_description: `Journey description ${locale}`, image: { url: `${site}/image.jpg` }, seo: { meta_title: `Journey SEO ${locale}`, meta_description: `Journey SEO description ${locale}`, canonical_url: `${site}/${eligible ? locale : 'en'}/journeys/${slug}`, is_indexable: eligible, alternates: alternatives(`/journeys/${slug}`) } }
  } else if (url.pathname === '/journeys/unknown') {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ message: 'Not found' }))
  } else if (url.pathname === '/journeys' || /\/reviews$|\/traveler-moments$/.test(url.pathname)) data = []
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ data }))
})
api.listen(0, '127.0.0.1')
await once(api, 'listening')
const portServer = createServer().listen(0, '127.0.0.1')
await once(portServer, 'listening')
const port = portServer.address().port
await new Promise(resolve => portServer.close(resolve))
const origin = `http://127.0.0.1:${port}`
let logs = ''
const child = spawn(process.execPath, ['.output/server/index.mjs'], { env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', NUXT_PUBLIC_API_BASE_URL: `http://127.0.0.1:${api.address().port}`, NUXT_PUBLIC_SITE_URL: site }, stdio: ['ignore', 'pipe', 'pipe'] })
child.stdout.on('data', chunk => { logs += chunk })
child.stderr.on('data', chunk => { logs += chunk })
try {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { await fetch(`${origin}/favicon.ico`); break } catch {
      if (child.exitCode !== null) throw new Error(logs)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  for (const path of ['/', '/about?ref=old', `/journeys/${slug}?adults=2`]) {
    const response = await fetch(origin + path, { redirect: 'manual', headers: { cookie: 'thevtravel-language=uk' } })
    assert.equal(response.status, 301, path)
    assert.equal(response.headers.get('location'), `/en${path === '/' ? '' : path}`)
  }
  for (const locale of ['en', 'uk', 'fr', 'de', 'ru', 'zh']) {
    for (const path of ['', '/about', `/journeys/${slug}?adults=2`]) {
      const response = await fetch(`${origin}/${locale}${path}`, { headers: { cookie: 'thevtravel-language=fr' } })
      const html = await response.text()
      assert.equal(response.status, 200, `${locale}${path}: ${logs}`)
      assert.match(html, new RegExp(`lang="${locale}"`))
      assert.match(html, new RegExp(`dir="${locale === 'ar' ? 'rtl' : 'ltr'}"`))
      const journey = path.startsWith('/journeys/')
      assert.match(html, new RegExp(`<title>${journey ? 'Journey SEO' : 'CMS title'} ${locale}</title>`))
      assert.match(html, /hreflang="uk"/)
      assert.match(html, /hreflang="x-default"/)
      assert.doesNotMatch(html, /hreflang="ar"|hreflang="zh"/)
      if (!['en', 'uk'].includes(locale)) assert.match(html, /name="robots" content="noindex/)
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/g) || []
      assert.equal(canonical.length, 1, `duplicate canonical: ${canonical}`)
      const canonicalPath = journey ? `/journeys/${slug}` : path
      assert.ok(canonical[0].includes(`${site}/${!['en', 'uk'].includes(locale) ? 'en' : locale}${canonicalPath}`), canonical[0])
      assert.ok(html.includes(`href="/${locale}/journeys"`), 'localized navigation missing')
    }
  }
  assert.equal((await fetch(`${origin}/xx/about`, { redirect: 'manual' })).status, 404)
  assert.equal((await fetch(`${origin}/uk/journeys/unknown`)).status, 404)
  assert.ok(requests.some(req => req.path === `/journeys/${slug}` && req.locale === 'uk'))
  assert.ok(requests.some(req => req.path === '/pages/about-us' && req.locale === 'fr'))
  const retired = await fetch(`${origin}/ar/about`, { redirect: 'manual' })
  assert.equal(retired.status, 301)
  assert.equal(retired.headers.get('location'), '/en/about')
  assert.ok(!requests.some(req => req.locale === 'ar'))
  console.log('PASS: legacy 301 redirects; URL authority against conflicting cookies; all six locales in SSR; dynamic API slug and locale; canonical/hreflang/noindex; retired Arabic redirects; navigation; unknown locale and journey 404.')
} finally {
  child.kill('SIGTERM')
  await once(child, 'exit')
  await new Promise(resolve => api.close(resolve))
}
