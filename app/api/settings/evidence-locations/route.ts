import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organization_id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const locations = await prisma.evidenceLocation.findMany({
      where: {
        organization_id: session.user.organization_id,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching evidence locations:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organization_id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const json = await req.json();
    const maxOrder = await prisma.evidenceLocation.findFirst({
      where: {
        organization_id: session.user.organization_id,
      },
      orderBy: {
        order: 'desc',
      },
      select: {
        order: true,
      },
    });

    const location = await prisma.evidenceLocation.create({
      data: {
        name: json.name,
        description: json.description,
        organization_id: session.user.organization_id,
        order: (maxOrder?.order || 0) + 1,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        resourceType: "EVIDENCE_LOCATION",
        resourceId: location.id.toString(),
        details: json,
        user_id: session.user.id,
        organization_id: session.user.organization_id,
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error('Error creating evidence location:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 