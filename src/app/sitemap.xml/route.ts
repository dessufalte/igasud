import { db } from "@/lib/db"

export const dynamic = "force-dynamic"
export const revalidate = 3600

interface SitemapEntry {
  loc: string
  priority: string
  changefreq: string
  lastmod?: Date | string
}

export async function GET() {
  try {
    const siteUrl = "https://igasud.tech"
    const now = new Date()

    const staticUrls: SitemapEntry[] = [
      { loc: "/", priority: "1.0", changefreq: "weekly" },
      { loc: "/#architecture", priority: "0.9", changefreq: "weekly" },
      { loc: "/#vision", priority: "0.8", changefreq: "monthly" },
      { loc: "/#contact", priority: "0.7", changefreq: "monthly" },
    ]

    const projects = await db.project.findMany({
      select: { slug: true, updatedAt: true },
    })
    const projectUrls: SitemapEntry[] = projects.map((p) => ({
      loc: `/#/project/${p.slug}`,
      priority: "0.8",
      changefreq: "monthly",
      lastmod: p.updatedAt,
    }))

    const allUrls: SitemapEntry[] = [...staticUrls, ...projectUrls]

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
