import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organization_id || session.user.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const json = await req.json();
    const user = await prisma.user.update({
      where: {
        id: parseInt(params.id),
        organization_id: session.user.organization_id,
      },
      data: {
        email: json.email,
        name: json.name,
        title: json.title,
        role: json.role,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        resourceType: "USER",
        resourceId: user.id.toString(),
        details: json,
        user_id: session.user.id,
        organization_id: session.user.organization_id,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 