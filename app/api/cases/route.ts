import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper function to serialize BigInt
function serializeBigInt(data: any): any {
  return JSON.parse(JSON.stringify(data, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user to access organization_id
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const json = await req.json();
    const { 
      name,
      description,
      caseCategory,  // Added this line
      caseType,
      casePriority,
      caseNotes,
      caseStatus,
      caseAssignee,
      caseExaminer,
      caseInvestigator,
      organization,
      chainOfCustody,
      caseDate
    } = json;

    const newCase = await prisma.case.create({
      data: {
        name,
        description,
        caseCategory,
        caseType,
        casePriority,
        caseNotes,
        status: caseStatus,
        caseAssignee,
        caseExaminer,
        caseInvestigator,
        organization_id: user.organization_id || undefined,
        chainOfCustody,
        caseDate: caseDate ? new Date(caseDate) : null,
        user_id: session.user.id,
        evidenceCount: 0,
        storageTotal: 0,
        activeTasks: 0,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log the case creation
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        resourceType: "CASE",
        resourceId: newCase.id.toString(),
        details: { name: newCase.name },
        user_id: session.user.id,
        organization_id: session.user.organization_id || 0,
      },
    });

    // Create default case actions after case is created
    await prisma.caseAction.createMany({
      data: [
        { name: "CheckedOut", description: "Evidence has been checked out", isDefault: true, order: 1, case_id: newCase.id },
        { name: "CheckedIn", description: "Evidence has been checked in", isDefault: true, order: 2, case_id: newCase.id },
        { name: "Transferred", description: "Evidence has been transferred", isDefault: true, order: 3, case_id: newCase.id },
        { name: "Examined", description: "Evidence has been examined", isDefault: true, order: 4, case_id: newCase.id },
        { name: "Analyzed", description: "Evidence has been analyzed", isDefault: true, order: 5, case_id: newCase.id },
      ],
    });

    return NextResponse.json(serializeBigInt(newCase));
  } catch (error) {
    console.error("[CASES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const cases = await prisma.case.findMany({
      where: {
        user_id: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        evidence: {
          select: {
            id: true,
            name: true,
            evidenceNumber: true,
            type: true,
            status: true,
            size: true,
          },
        },
        notes: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
        activities: {
          select: {
            id: true,
            description: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(serializeBigInt(cases));
  } catch (error) {
    console.error("[CASES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
