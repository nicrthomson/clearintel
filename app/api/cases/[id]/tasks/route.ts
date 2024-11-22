import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const caseId = parseInt(params.id)
    if (isNaN(caseId)) {
      return new NextResponse("Invalid case ID", { status: 400 })
    }

    const tasks = await prisma.task.findMany({
      where: {
        case_id: caseId,
      },
      include: {
        assignedTo: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("[TASKS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const caseId = parseInt(params.id)
    if (isNaN(caseId)) {
      return new NextResponse("Invalid case ID", { status: 400 })
    }

    const json = await request.json()
    const { name, description, priority, dueDate, estimatedHours } = json

    const task = await prisma.task.create({
      data: {
        name,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours,
        case_id: caseId,
      },
      include: {
        assignedTo: {
          select: {
            name: true,
          },
        },
      },
    })

    // Update case active tasks count
    await prisma.case.update({
      where: { id: caseId },
      data: {
        activeTasks: {
          increment: 1,
        },
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("[TASK_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
