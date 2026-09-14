import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(80, { message: "Name is too long" }),
  email: z.string().trim().email({ message: "Please enter a valid email" }),
  message: z
    .string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(2000, { message: "Message is too long" }),
})

// Basic rate-limit by IP (in-memory, per server instance)
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 min
const RATE_LIMIT_MAX = 3
const hits = new Map<string, { count: number; resetAt: number }>()

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 })
    }

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return NextResponse.json(
        { error: first?.message ?? "Invalid input" },
        { status: 422 }
      )
    }

    // Rate limit
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "local"
    const now = Date.now()
    const rec = hits.get(ip)
    if (rec && rec.resetAt > now) {
      if (rec.count >= RATE_LIMIT_MAX) {
        return NextResponse.json(
          { error: "Too many messages. Please try again in a minute." },
          { status: 429 }
        )
      }
      rec.count += 1
    } else {
      hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    }

    const saved = await db.message.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        body: parsed.data.message,
      },
      select: { id: true, createdAt: true },
    })

    return NextResponse.json({
      ok: true,
      id: saved.id,
      createdAt: saved.createdAt,
    })
  } catch (error) {
    console.error("[POST /api/contact]", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    )
  }
}
