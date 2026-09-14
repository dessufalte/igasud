import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const project = await db.project.findUnique({
      where: { slug },
      include: {
        docs: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            section: true,
            icon: true,
            order: true,
            content: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    const data = {
      ...project,
      techStack: JSON.parse(project.techStack) as string[],
      links: project.links ? JSON.parse(project.links) : null,
    }

    return NextResponse.json({ project: data })
  } catch (error) {
    console.error("[GET /api/projects/[slug]]", error)
    return NextResponse.json(
      { error: "Failed to load project" },
      { status: 500 }
    )
  }
}
