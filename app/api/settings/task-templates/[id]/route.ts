import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organization_id) {
      return NextResponse.json(
        { error: "Unauthorized - No organization context" },
        { status: 401 }
      );
    }

    const templateId = parseInt(params.id);
    if (isNaN(templateId)) {
      return NextResponse.json(
        { error: "Invalid template ID" },
        { status: 400 }
      );
    }

    // Verify the template belongs to the organization
    const template = await prisma.taskTemplate.findFirst({
      where: {
        id: templateId,
        organization_id: session.user.organization_id,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    await prisma.taskTemplate.delete({
      where: {
        id: templateId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task template:", error);
    return NextResponse.json(
      { error: "Failed to delete task template" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organization_id) {
      return NextResponse.json(
        { error: "Unauthorized - No organization context" },
        { status: 401 }
      );
    }

    const templateId = parseInt(params.id);
    if (isNaN(templateId)) {
      return NextResponse.json(
        { error: "Invalid template ID" },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Verify the template belongs to the organization
    const template = await prisma.taskTemplate.findFirst({
      where: {
        id: templateId,
        organization_id: session.user.organization_id,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const updatedTemplate = await prisma.taskTemplate.update({
      where: {
        id: templateId,
      },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        estimatedHours: data.estimatedHours,
        checklist: data.checklist,
      },
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Error updating task template:", error);
    return NextResponse.json(
      { error: "Failed to update task template" },
      { status: 500 }
    );
  }
}
