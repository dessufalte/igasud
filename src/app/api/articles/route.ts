import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const articles = await db.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        tag: true,
        readingMins: true,
        publishedAt: true,
      },
    })
    return NextResponse.json({ articles })
  } catch (error) {
    console.error("[GET /api/articles]", error)
    return NextResponse.json(
      { error: "Failed to load articles" },
      { status: 500 }
    )
  }
}
