import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "data")
    const [profileRaw, projectsRaw] = await Promise.all([
      fs.readFile(path.join(dataDir, "profile.json"), "utf-8"),
      fs.readFile(path.join(dataDir, "projects.json"), "utf-8"),
    ])
    const profile = JSON.parse(profileRaw)
    const projects = JSON.parse(projectsRaw)
    return NextResponse.json({ profile, projects })
  } catch (error) {
    console.error("[GET /api/data]", error)
    return NextResponse.json(
      { error: "Failed to load data" },
      { status: 500 }
    )
  }
}
