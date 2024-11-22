import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.contact.delete({
      where: {
        id: parseInt(params.id)
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    const updatedContact = await prisma.contact.update({
      where: {
        id: parseInt(params.id)
      },
      data: {
        ...data,
        updatedAt: new Date()
      }
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
