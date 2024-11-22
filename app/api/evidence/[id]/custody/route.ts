import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const evidenceId = parseInt(params.id)
    if (isNaN(evidenceId)) {
      return new NextResponse("Invalid evidence ID", { status: 400 })
    }

    const json = await request.json()
    const { action, reason, location, signature } = json

    // Create chain of custody record
    const record = await prisma.chainOfCustody.create({
      data: {
        evidence_id: evidenceId,
        user_id: session.user.id,
        action,
        reason,
        location,
        signature,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Update evidence status based on action
    await prisma.evidence.update({
      where: {
        id: evidenceId,
      },
      data: {
        status: action === 'CheckedOut' ? 'Checked Out' : 
                action === 'CheckedIn' ? 'In Custody' : 
                action === 'Transferred' ? 'Transferred' : 
                undefined,
        location: location,
      },
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error("[CUSTODY_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const evidenceId = parseInt(params.id)
    if (isNaN(evidenceId)) {
      return new NextResponse("Invalid evidence ID", { status: 400 })
    }

    const records = await prisma.chainOfCustody.findMany({
      where: {
        evidence_id: evidenceId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error("[CUSTODY_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
