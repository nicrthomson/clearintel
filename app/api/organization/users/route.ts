import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";

interface UserWithRole {
  role: Role;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the current user to find their organization
    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        name: true,
        organization_id: true,
        role: true,
      },
    });

    if (!currentUser?.organization_id) {
      return new NextResponse("No organization found", { status: 404 });
    }

    // Get all users from the same organization
    const users = await prisma.user.findMany({
      where: {
        organization_id: currentUser.organization_id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isOrgAdmin: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[ORGANIZATION_USERS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        organization_id: true,
        isOrgAdmin: true,
      },
    });

    if (!currentUser?.organization_id) {
      return new NextResponse("No organization found", { status: 404 });
    }

    if (!currentUser.isOrgAdmin) {
      return new NextResponse("Only organization admins can modify user roles", { status: 403 });
    }

    const data = await request.json();
    const { userId, role } = data;

    // Prevent changing own role
    if (userId === currentUser.id) {
      return new NextResponse("Cannot change own role", { status: 400 });
    }

    // Verify user belongs to same organization
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        organization_id: currentUser.organization_id,
      },
    });

    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isOrgAdmin: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[UPDATE_USER_ROLE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        organization_id: true,
        isOrgAdmin: true,
        organization: {
          select: {
            id: true,
            maxUsers: true,
            maxReadOnlyUsers: true,
            users: {
              select: {
                role: true
              }
            }
          }
        }
      },
    });

    if (!currentUser?.organization_id || !currentUser.organization) {
      return new NextResponse("No organization found", { status: 404 });
    }

    if (!currentUser.isOrgAdmin) {
      return new NextResponse("Only organization admins can invite users", { status: 403 });
    }

    const data = await request.json();
    const { email, role } = data;

    // Check user limits
    const currentUsers = currentUser.organization.users;
    const regularUserCount = currentUsers.filter((u: UserWithRole) => u.role === 'USER').length;
    const readOnlyUserCount = currentUsers.filter((u: UserWithRole) => u.role === 'READ_ONLY').length;

    if (role === 'USER' && regularUserCount >= currentUser.organization.maxUsers) {
      return new NextResponse("Regular user limit reached", { status: 400 });
    }

    if (role === 'READ_ONLY' && readOnlyUserCount >= currentUser.organization.maxReadOnlyUsers) {
      return new NextResponse("Read-only user limit reached", { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        role,
        // This is just for demonstration. In production, you'd send an invitation email
        // and have the user set their own password through a secure flow
        password: 'temporary-password',
        organization: {
          connect: { id: currentUser.organization.id }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isOrgAdmin: true,
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error("[INVITE_USER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
