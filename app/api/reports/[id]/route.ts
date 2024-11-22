import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { unlink } from "fs/promises"
import path from "path"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      )
    }

    // First get the report without template relation
    const report = await prisma.generatedReport.findUnique({
      where: { id: parseInt(params.id) },
      select: {
        id: true,
        filePath: true,
        userId: true
      }
    })

    if (!report) {
      return new NextResponse(
        JSON.stringify({ error: "Report not found" }), 
        { status: 404 }
      )
    }

    // Check ownership
    if (report.userId !== session.user.id) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 403 }
      )
    }

    // Delete the file
    try {
      const fullPath = path.join(process.cwd(), 'public', report.filePath)
      await unlink(fullPath)
    } catch (error) {
      console.error("File deletion error:", error)
      // Continue with database deletion even if file deletion fails
    }

    // Delete the report
    await prisma.generatedReport.delete({
      where: { id: report.id }
    })

    return new NextResponse(null, { status: 204 })

  } catch (error) {
    console.error("API Error:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal Error",
        details: error instanceof Error ? error.message : "Unknown error"
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
} 