import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organization_id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        organization_id: session.user.organization_id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        title: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organization_id || session.user.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const json = await req.json();
    
    // Ensure password is provided
    if (!json.password) {
      return new NextResponse("Password is required", { status: 400 });
    }

    // Hash the password
    const hashedPassword = await hash(json.password, 12);

    const user = await prisma.user.create({
      data: {
        email: json.email,
        name: json.name,
        password: hashedPassword,
        role: json.role || 'USER',
        title: json.title,
        organization_id: session.user.organization_id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        title: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        resourceType: "USER",
        resourceId: user.id.toString(),
        details: { email: user.email, role: user.role },
        user_id: session.user.id,
        organization_id: session.user.organization_id,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
