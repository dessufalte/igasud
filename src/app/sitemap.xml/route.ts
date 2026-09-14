import { db } from "@/lib/db"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // 1 hour

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET() {
  try {
    const siteUrl = "https://studio.example"
    const now = new Date()

    // Static pages (single-page app sections)
    const staticUrls = [
      { loc: "/", priority: "1.0", changefreq: "weekly" },
      { loc: "/#work", priority: "0.9", changefreq: "weekly" },
      { loc: "/#about", priority: "0.7", changefreq: "monthly" },
      { loc: "/#skills", priority: "0.7", changefreq: "monthly" },
      { loc: "/#writing", priority: "0.9", changefreq: "weekly" },
      { loc: "/#contact", priority: "0.6", changefreq: "monthly" },
    ]

    // Project doc deep-links
    const projects = await db.project.findMany({
      select: { slug: true, updatedAt: true },
    })
    const projectUrls = projects.map((p) => ({
      loc: `/#/project/${p.slug}`,
      priority: "0.8",
      changefreq: "monthly",
      lastmod: p.updatedAt,
    }))

    // Article deep-links
    const articles = await db.article.findMany({
      where: { published: true },
      select: { slug: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    })
    const articleUrls = articles.map((a) => ({
      loc: `/#/article/${a.slug}`,
      priority: "0.8",
      changefreq: "monthly",
      lastmod: a.publishedAt,
    }))

    const allUrls = [...staticUrls, ...projectUrls, ...articleUrls]

    const urls = allUrls
      .map((u) => {
        const lastmod = u.lastmod
          ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>`
          : `<lastmod>${now.toISOString()}</lastmod>`
        return `  <url>
    <loc>${siteUrl}${u.loc}</loc>
    ${lastmod}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
      })
      .join("\n")

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("[GET /sitemap.xml]", error)
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
      { status: 500, headers: { "Content-Type": "application/xml" } }
    )
  }
}
