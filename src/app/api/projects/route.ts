import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: [{ featured: "desc" }, { year: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        tagline: true,
        description: true,
        category: true,
        year: true,
        status: true,
        featured: true,
        accent: true,
        thumbnail: true,
        techStack: true,
        links: true,
        _count: { select: { docs: true } },
      },
    })

    const data = projects.map((p) => ({
      ...p,
      techStack: JSON.parse(p.techStack) as string[],
      links: p.links ? JSON.parse(p.links) : null,
    }))

    return NextResponse.json({ projects: data })
  } catch (error) {
    console.error("[GET /api/projects]", error)
    return NextResponse.json(
      { error: "Failed to load projects" },
      { status: 500 }
    )
  }
}
