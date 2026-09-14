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
    const articles = await db.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        tag: true,
        publishedAt: true,
      },
    })

    const siteUrl = "https://studio.example"
    const lastBuild = articles[0]?.publishedAt ?? new Date()

    const items = articles
      .map(
        (a) => `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${siteUrl}/#/article/${a.slug}</link>
      <guid isPermaLink="true">${siteUrl}/#/article/${a.slug}</guid>
      <description>${escapeXml(a.excerpt)}</description>
      <category>${escapeXml(a.tag)}</category>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
    </item>`
      )
      .join("\n")

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Studio — Writing</title>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/api/feed.xml" rel="self" type="application/rss+xml" />
    <description>Essays and field notes on design systems, edge architecture, and shipping software.</description>
    <language>en</language>
    <lastBuildDate>${new Date(lastBuild).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("[GET /api/feed.xml]", error)
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title></channel></rss>',
      { status: 500, headers: { "Content-Type": "application/xml" } }
    )
  }
}
