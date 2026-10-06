import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const toAbsolute = (p) => path.resolve(__dirname, p)

const template = fs.readFileSync(toAbsolute('dist/index.html'), 'utf-8')

const SITE_URL = 'https://evaliyachts.com'

// Safety check for placeholder
if (!template.includes('<!--app-html-->')) {
  console.error('ERROR: Template does not contain <!--app-html--> placeholder!')
  console.log('Current template content:', template.substring(0, 500))
  process.exit(1)
}

const { render } = await import('./dist/server/entry-server.js')

// ── Read yacht & service slugs from source ──
let yachtSlugs = []
let serviceSlugs = []

try {
  const yachtsContent = fs.readFileSync(toAbsolute('src/data/yachts.ts'), 'utf-8')
  yachtSlugs = Array.from(yachtsContent.matchAll(/slug:\s*["']([^"']+)["']/g), m => m[1])
  console.log(`Found ${yachtSlugs.length} yacht slugs`)
} catch (e) {
  console.warn('Could not read yachts data:', e.message)
}

try {
  const servicesContent = fs.readFileSync(toAbsolute('src/data/services.ts'), 'utf-8')
  serviceSlugs = Array.from(servicesContent.matchAll(/slug:\s*["']([^"']+)["']/g), m => m[1])
  console.log(`Found ${serviceSlugs.length} service slugs`)
} catch (e) {
  console.warn('Could not read services data:', e.message)
}

// ── Routes to prerender ──
const routesToPrerender = [
  '/',
  '/yachts',
  '/services',
  '/evali-yachts',
  '/about',
  '/contact',
  '/blogs',
  '/faq',
  '/sitemap',
  '/privacy-policy',
  '/terms-and-conditions',
  '/yacht-rental-in-dubai',
  '/cruises-in-dubai',
  '/yacht-parties-dubai',
  '/new-years-eve-2026',
  '/new-years-eve-2026-yachts',
  '/yacht-rental-dubai',
  '/yacht-for-rent-dubai',
  '/yacht-charter-dubai',
  '/yacht-hire-dubai',
  '/dubai-yacht-booking',
  '/dubai-yacht-party',
  '/luxury-yacht-rental-dubai',
]

// ── Render & save a single page ──
function renderAndSavePage(routeUrl, filePath) {
  console.log(`\nPre-rendering: ${routeUrl}`)
  const { html: appHtml, title, description, keywords, canonicalUrl, robots } = render(routeUrl)

  if (!appHtml || appHtml.length < 100) {
    console.error(`ERROR: SSR returned empty or minimal HTML for ${routeUrl}`)
    return false
  }

  console.log(`SSR HTML length: ${appHtml.length} characters`)

  let processedHtml = template
    .replace('<!--app-html-->', appHtml)
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/,
      `<meta name="description" content="${description}">`
    )
    .replace(
      /<meta\s+name="keywords"\s+content=".*?"\s*\/?>/,
      keywords ? `<meta name="keywords" content="${keywords}">` : ''
    )
    .replace(
      /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/,
      `<link rel="canonical" href="${canonicalUrl}">`
    )
    .replace(
      /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/,
      `<meta property="og:title" content="${title}">`
    )
    .replace(
      /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/,
      `<meta property="og:description" content="${description}">`
    )
    .replace(
      /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/,
      `<meta property="og:url" content="${canonicalUrl}">`
    )

  if (robots) processedHtml = processedHtml.replace('</head>', `<meta name="robots" content="${robots}"></head>`)

  if (processedHtml.includes('<!--app-html-->')) {
    console.error(`ERROR: Failed to replace app-html placeholder for ${routeUrl}`)
    return false
  }

  const dir = path.dirname(toAbsolute(filePath))
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(toAbsolute(filePath), processedHtml)
  console.log(`✓ Pre-rendered: ${filePath} (${processedHtml.length} bytes)`)
  return true
}

// ── Generate sitemap.xml ──
function generateSitemap(yachts, services) {
  const currentDate = new Date().toISOString().split('T')[0]
  const blogIds = [1, 2, 3, 4, 5, 6]

  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/yachts', priority: '0.9', changefreq: 'daily' },
    { path: '/services', priority: '0.9', changefreq: 'weekly' },
    { path: '/evali-yachts', priority: '0.9', changefreq: 'monthly' },
    { path: '/about', priority: '0.8', changefreq: 'monthly' },
    { path: '/contact', priority: '0.8', changefreq: 'monthly' },
    { path: '/blogs', priority: '0.8', changefreq: 'weekly' },
    { path: '/faq', priority: '0.7', changefreq: 'monthly' },
    { path: '/sitemap', priority: '0.6', changefreq: 'monthly' },
    { path: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
    { path: '/terms-and-conditions', priority: '0.5', changefreq: 'yearly' },
    { path: '/yacht-rental-in-dubai', priority: '0.9', changefreq: 'weekly' },
    { path: '/cruises-in-dubai', priority: '0.9', changefreq: 'weekly' },
    { path: '/yacht-parties-dubai', priority: '0.9', changefreq: 'weekly' },
    { path: '/new-years-eve-2026', priority: '0.9', changefreq: 'daily' },
    { path: '/new-years-eve-2026-yachts', priority: '0.9', changefreq: 'daily' },
    { path: '/yacht-rental-dubai', priority: '0.9', changefreq: 'weekly' },
    { path: '/yacht-for-rent-dubai', priority: '0.9', changefreq: 'weekly' },
    { path: '/yacht-charter-dubai', priority: '0.9', changefreq: 'weekly' },
    { path: '/yacht-hire-dubai', priority: '0.9', changefreq: 'weekly' },
    { path: '/dubai-yacht-booking', priority: '0.9', changefreq: 'weekly' },
    { path: '/dubai-yacht-party', priority: '0.9', changefreq: 'weekly' },
    { path: '/luxury-yacht-rental-dubai', priority: '0.9', changefreq: 'weekly' },
  ]

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  staticPages.forEach(page => {
    xml += `  <url>\n    <loc>${SITE_URL}${page.path}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`
  })

  yachts.forEach(slug => {
    xml += `  <url>\n    <loc>${SITE_URL}/yacht/${slug}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`
  })

  // Multiple source records may share one canonical service URL.
  // Keep every unique owner, in source order, without duplicating sitemap entries.
  new Set(services).forEach(slug => {
    xml += `  <url>\n    <loc>${SITE_URL}/services/${slug}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`
  })

  blogIds.forEach(id => {
    xml += `  <url>\n    <loc>${SITE_URL}/blog/${id}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`
  })

  xml += '</urlset>'
  return xml
}

// ── Main ──
;(async () => {
  console.log('--- Pre-rendering static pages ---')
  for (const routeUrl of routesToPrerender) {
    const filePath = `dist${routeUrl === '/' ? '/index' : routeUrl}.html`
    renderAndSavePage(routeUrl, filePath)
  }

  console.log('\n--- Pre-rendering yacht detail pages ---')
  yachtSlugs.forEach(slug => renderAndSavePage(`/yacht/${slug}`, `dist/yacht/${slug}.html`))

  console.log('\n--- Pre-rendering service detail pages ---')
  serviceSlugs.forEach(slug => renderAndSavePage(`/services/${slug}`, `dist/services/${slug}.html`))

  console.log('\n--- Pre-rendering blog detail pages ---')
  ;[1, 2, 3, 4, 5, 6].forEach(id => renderAndSavePage(`/blog/${id}`, `dist/blog/${id}.html`))

  console.log('\n--- Generating sitemap.xml ---')
  const sitemap = generateSitemap(yachtSlugs, serviceSlugs)
  fs.writeFileSync(toAbsolute('dist/sitemap.xml'), sitemap)
  const urlCount = sitemap.split('<url>').length - 1
  console.log(`✓ Generated sitemap.xml with ${urlCount} URLs`)
})()
