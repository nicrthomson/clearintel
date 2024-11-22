import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Add serialization helper at the top of the file
function serializeBigInt(data: any): any {
  return JSON.parse(JSON.stringify(data, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
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

    const caseData = await prisma.case.findUnique({
      where: {
        id: parseInt(params.id),
        user_id: session.user.id, // Ensure user can only access their own cases
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        notes: {
          include: {
            user: true,
          },
        },
        evidence: {
          include: {
            type: true,
            customFields: {
              include: {
                field: true,
              },
            },
            chainOfCustody: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
        activities: true,
      },
    })

    if (!caseData) {
      return new NextResponse("Case not found", { status: 404 })
    }

    // Convert BigInt values to strings before JSON serialization
    const serializedData = JSON.parse(JSON.stringify(caseData, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ))

    return NextResponse.json(serializedData)
  } catch (error) {
    console.error("[CASE_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await request.json()
    
    // Clean up and format the data before sending to Prisma
    const cleanedData = {
      name: data.name,
      chainOfCustody: data.chainOfCustody,
      caseDate: data.caseDate ? new Date(data.caseDate).toISOString() : null,
      caseCategory: data.caseCategory,  // Added this line
      caseType: data.caseType,
      status: data.status,
      description: data.description,
      caseNotes: data.caseNotes,
      casePriority: data.casePriority,
      caseAssignee: data.caseAssignee,
      caseExaminer: data.caseExaminer,
      caseInvestigator: data.caseInvestigator,
      organizationName: data.organization // Store the organization name in the correct field
    }

    const updatedCase = await prisma.case.update({
      where: {
        id: parseInt(params.id),
        user_id: session.user.id,
      },
      data: cleanedData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        notes: {
          include: {
            user: true,
          },
        },
        evidence: {
          include: {
            type: true,
            customFields: {
              include: {
                field: true,
              },
            },
            chainOfCustody: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
        activities: true,
      },
    })

    // Add audit log for case update
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        resourceType: "CASE", 
        resourceId: updatedCase.id.toString(),
        details: {
          changes: cleanedData,
          caseId: updatedCase.id
        },
        user_id: session.user.id,
        organization_id: session.user.organization_id || 0,
      },
    });

    return NextResponse.json(serializeBigInt(updatedCase))
  } catch (error) {
    console.error("[CASE_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.case.delete({
      where: {
        id: parseInt(params.id),
        user_id: session.user.id, // Ensure user can only delete their own cases
      },
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error in DELETE /api/cases/[id]:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await request.json();
    const updatedCase = await prisma.case.update({
      where: {
        id: parseInt(params.id),
        user_id: session.user.id,
      },
      data: json,
    });

    // Add audit log for case update
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        resourceType: "CASE",
        resourceId: updatedCase.id.toString(),
        details: { 
          changes: json,
          caseId: updatedCase.id
        },
        user_id: session.user.id,
        organization_id: session.user.organization_id || 0,
      },
    });

    return NextResponse.json(updatedCase);
  } catch (error) {
    console.error("[CASE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
