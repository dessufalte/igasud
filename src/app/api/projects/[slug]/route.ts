import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const dataDir = path.join(process.cwd(), "data")
    const raw = await fs.readFile(path.join(dataDir, "projects.json"), "utf-8")
    const projects = JSON.parse(raw)
    const project = projects.find((p: any) => p.slug === slug)
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ project })
  } catch (error) {
    console.error("[GET /api/projects/[slug]]", error)
    return NextResponse.json(
      { error: "Failed to load project" },
      { status: 500 }
    )
  }
}
