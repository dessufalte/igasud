import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

const patchSchema = z.object({
  read: z.boolean().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 422 })
    }
    const updated = await db.message.update({
      where: { id },
      data: parsed.data,
      select: { id: true, read: true },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("[PATCH /api/admin/messages/[id]]", error)
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.message.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[DELETE /api/admin/messages/[id]]", error)
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    )
  }
}
