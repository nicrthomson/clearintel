import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request) {
  try {
    const { items } = await request.json()
    
    for (const [index, item] of items.entries()) {
      await prisma.evidenceType.update({
        where: { id: item.id },
        data: { order: index }
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reorder evidence types" },
      { status: 500 }
    )
  }
} 