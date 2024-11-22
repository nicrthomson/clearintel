import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log(`[QA_CHECKLIST_PUT] Request received for id: ${params.id}`);
  try {
    const session = await getServerSession(authOptions);
    console.log("[QA_CHECKLIST_PUT] Session:", JSON.stringify(session, null, 2));

    if (!session?.user?.organization_id) {
      console.log("[QA_CHECKLIST_PUT] Unauthorized - missing organization_id");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    console.log("[QA_CHECKLIST_PUT] Request body:", JSON.stringify(json, null, 2));

    const item = await prisma.qAChecklistItem.update({
      where: {
        id: parseInt(params.id),
        organization_id: session.user.organization_id,
      },
      data: json,
    });

    console.log("[QA_CHECKLIST_PUT] Updated item:", JSON.stringify(item, null, 2));
    return NextResponse.json(item);
  } catch (error) {
    console.error('[QA_CHECKLIST_PUT] Error:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log(`[QA_CHECKLIST_DELETE] Request received for id: ${params.id}`);
  try {
    const session = await getServerSession(authOptions);
    console.log("[QA_CHECKLIST_DELETE] Session:", JSON.stringify(session, null, 2));

    if (!session?.user?.organization_id) {
      console.log("[QA_CHECKLIST_DELETE] Unauthorized - missing organization_id");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.qAChecklistItem.delete({
      where: {
        id: parseInt(params.id),
        organization_id: session.user.organization_id,
      },
    });

    console.log("[QA_CHECKLIST_DELETE] Successfully deleted item");
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[QA_CHECKLIST_DELETE] Error:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
