import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const caseId = parseInt(params.id)
    const taskId = parseInt(params.taskId)
    if (isNaN(caseId) || isNaN(taskId)) {
      return new NextResponse("Invalid ID", { status: 400 })
    }

    const json = await request.json()
    const { status, actualHours } = json

    const task = await prisma.task.update({
      where: {
        id: taskId,
        case_id: caseId,
      },
      data: {
        status,
        actualHours,
      },
      include: {
        assignedTo: {
          select: {
            name: true,
          },
        },
      },
    })

    // Update case active tasks count if task is completed
    if (status === 'Completed') {
      await prisma.case.update({
        where: { id: caseId },
        data: {
          activeTasks: {
            decrement: 1,
          },
        },
      })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("[TASK_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const caseId = parseInt(params.id)
    const taskId = parseInt(params.taskId)
    if (isNaN(caseId) || isNaN(taskId)) {
      return new NextResponse("Invalid ID", { status: 400 })
    }

    // Get task status before deletion
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    })

    await prisma.task.delete({
      where: {
        id: taskId,
        case_id: caseId,
      },
    })

    // Update case active tasks count if deleted task was not completed
    if (task && task.status !== 'Completed') {
      await prisma.case.update({
        where: { id: caseId },
        data: {
          activeTasks: {
            decrement: 1,
          },
        },
      })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[TASK_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
