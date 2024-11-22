import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const types = await prisma.evidenceType.findMany({
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(types)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch evidence types" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const type = await prisma.evidenceType.create({
      data: {
        name: body.name,
        description: body.description,
        organization_id: 1 // You'll need to get this from the session/context
      }
    })
    
    return NextResponse.json(type)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create evidence type" },
      { status: 500 }
    )
  }
}