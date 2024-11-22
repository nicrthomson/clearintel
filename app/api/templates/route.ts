import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { defaultTemplate } from "@/lib/defaultTemplate";

export async function GET(
  request: Request,
  { params }: { params: { caseId: string } }
) {
  console.log("[QA_RESPONSES_GET] Request received");
  try {
    const session = await getServerSession(authOptions);
    console.log("[QA_RESPONSES_GET] Session:", JSON.stringify(session, null, 2));

    if (!session?.user?.organization_id) {
      console.log("[QA_RESPONSES_GET] Unauthorized - missing organization_id");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const caseId = parseInt(params.caseId);
    if (isNaN(caseId)) {
      return new NextResponse("Invalid case ID", { status: 400 });
    }

    // First check if organization has any checklist items
    let checklistItems = await prisma.qAChecklistItem.findMany({
      where: {
        organization_id: session.user.organization_id,
      },
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
      ],
    });

    // If no checklist items exist, create default ones
    if (checklistItems.length === 0) {
      console.log("[QA_RESPONSES_GET] No checklist items found, creating defaults");
      await prisma.qAChecklistItem.createMany({
        data: defaultTemplate.checklistItems.map(item => ({
          ...item,
          organization_id: session.user.organization_id!
        }))
      });

      checklistItems = await prisma.qAChecklistItem.findMany({
        where: {
          organization_id: session.user.organization_id,
        },
        orderBy: [
          { category: 'asc' },
          { order: 'asc' },
        ],
      });
    }

    // Now get or create responses for this case
    let responses = await prisma.qAChecklistResponse.findMany({
      where: {
        case_id: caseId,
      },
      include: {
        checklistItem: true,
        completedBy: {
          select: { name: true }
        }
      },
      orderBy: [
        { checklistItem: { category: 'asc' } },
        { checklistItem: { order: 'asc' } }
      ]
    });

    // If no responses exist, create them based on checklist items
    if (responses.length === 0) {
      console.log("[QA_RESPONSES_GET] No responses found, creating defaults");
      await prisma.qAChecklistResponse.createMany({
        data: checklistItems.map(item => ({
          case_id: caseId,
          checklist_item_id: item.id,
          completed: false,
          completed_by: session.user.id,
          value: "",
          notes: null
        }))
      });

      responses = await prisma.qAChecklistResponse.findMany({
        where: {
          case_id: caseId,
        },
        include: {
          checklistItem: true,
          completedBy: {
            select: { name: true }
          }
        },
        orderBy: [
          { checklistItem: { category: 'asc' } },
          { checklistItem: { order: 'asc' } }
        ]
      });
    }

    console.log(`[QA_RESPONSES_GET] Found ${responses.length} responses`);
    return NextResponse.json(responses);
  } catch (error) {
    console.error("[QA_RESPONSES_GET] Error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
