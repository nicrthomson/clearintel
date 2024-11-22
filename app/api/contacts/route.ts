import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contacts = await prisma.contact.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Fetch contacts error:', error)
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    const contact = await prisma.contact.create({
      data: {
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        organization: body.organization || null,
        notes: body.notes || null,
        important: body.important || false
      }
    })
    
    return NextResponse.json(contact)
  } catch (error) {
    console.error('Create contact error:', error)
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    const updatedContact = await prisma.contact.update({
      where: {
        id: parseInt(params.id)
      },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        organization: data.organization,
        notes: data.notes,
        important: data.important,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedContact)
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    )
  }
}
