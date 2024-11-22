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
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      )
    }

    const caseId = parseInt(params.id)
    
    // First get reports without template relation
    const reports = await prisma.generatedReport.findMany({
      where: {
        caseId,
        userId: session.user.id
      },
      select: {
        id: true,
        name: true,
        fileType: true,
        filePath: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        caseId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Then get template info separately for reports that have templates
    const reportsWithTemplates = await Promise.all(
      reports.map(async (report) => {
        const template = await prisma.reportTemplate.findFirst({
          where: {
            generatedReports: {
              some: {
                id: report.id
              }
            }
          },
          select: {
            id: true,
            name: true,
            type: true
          }
        })

        return {
          ...report,
          id: Number(report.id),
          userId: Number(report.userId),
          caseId: Number(report.caseId),
          createdAt: report.createdAt.toISOString(),
          updatedAt: report.updatedAt.toISOString(),
          user: {
            ...report.user,
            id: Number(report.user.id)
          },
          template: template ? {
            ...template,
            id: Number(template.id)
          } : null
        }
      })
    )

    return new NextResponse(
      JSON.stringify(reportsWithTemplates),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error("[CASE_REPORTS_GET]", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error"
      }), 
      { status: 500 }
    )
  }
} 