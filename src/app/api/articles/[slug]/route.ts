import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const article = await db.article.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        body: true,
        tag: true,
        readingMins: true,
        publishedAt: true,
      },
    })
    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ article })
  } catch (error) {
    console.error("[GET /api/articles/[slug]]", error)
    return NextResponse.json(
      { error: "Failed to load article" },
      { status: 500 }
    )
  }
}
