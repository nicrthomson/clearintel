import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { organization_id: true }
    })

    if (!user?.organization_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const message = formData.get("message") as string
    const contactId = parseInt(formData.get("contactId") as string)
    
    // For now, we'll just store file names without actual uploads
    const files = formData.getAll("files") as File[]
    const attachmentsData = files.map(file => ({
      filename: file.name,
      size: file.size,
      contentType: file.type
    }))

    const newMessage = await prisma.message.create({
      data: {
        message,
        contact_id: contactId,
        organization_id: user.organization_id,
        attachments: attachmentsData.length > 0 ? attachmentsData : undefined,
      },
      include: {
        case: true,
      },
    })

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    )
  }
} 