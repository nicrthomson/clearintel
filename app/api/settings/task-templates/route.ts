import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organization_id) {
      return NextResponse.json(
        { error: "Unauthorized - No organization context" },
        { status: 401 }
      );
    }

    const templates = await prisma.taskTemplate.findMany({
      where: {
        organization_id: session.user.organization_id,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching task templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch task templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organization_id) {
      return NextResponse.json(
        { error: "Unauthorized - No organization context" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const template = await prisma.taskTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        estimatedHours: data.estimatedHours,
        checklist: data.checklist,
        organization: {
          connect: {
            id: session.user.organization_id,
          },
        },
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error creating task template:", error);
    return NextResponse.json(
      { error: "Failed to create task template" },
      { status: 500 }
    );
  }
}
