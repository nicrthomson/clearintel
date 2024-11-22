import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { defaultTemplate } from "@/lib/defaultTemplate";

export async function GET() {
  console.log("[QA_CHECKLIST_GET] Request received");
  try {
    const session = await getServerSession(authOptions);
    console.log("[QA_CHECKLIST_GET] Session:", JSON.stringify(session, null, 2));
    
    if (!session?.user?.organization_id) {
      console.log("[QA_CHECKLIST_GET] Unauthorized - missing organization_id");
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    console.log(`[QA_CHECKLIST_GET] Fetching items for org: ${session.user.organization_id}`);
    let items = await prisma.qAChecklistItem.findMany({
      where: {
        organization_id: session.user.organization_id,
      },
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
      ],
    });

    // If no items exist, create default items
    if (items.length === 0) {
      console.log("[QA_CHECKLIST_GET] No items found, creating defaults");
      await prisma.qAChecklistItem.createMany({
        data: defaultTemplate.checklistItems.map(item => ({
          ...item,
          organization_id: session.user.organization_id!
        }))
      });

      items = await prisma.qAChecklistItem.findMany({
        where: {
          organization_id: session.user.organization_id,
        },
        orderBy: [
          { category: 'asc' },
          { order: 'asc' },
        ],
      });
    }
    
    console.log(`[QA_CHECKLIST_GET] Found ${items.length} items:`, JSON.stringify(items, null, 2));
    return NextResponse.json(items);
  } catch (error) {
    console.error('[QA_CHECKLIST_GET] Error:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}