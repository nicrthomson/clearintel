import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organization_id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const location = await prisma.evidenceLocation.delete({
      where: {
        id: parseInt(params.id),
        organization_id: session.user.organization_id,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        resourceType: "EVIDENCE_LOCATION",
        resourceId: location.id.toString(),
        user_id: session.user.id,
        organization_id: session.user.organization_id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting evidence location:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 