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
    const settings = await prisma.organizationSetting.findUnique({
      where: {
        organization_id_key: {
          organization_id: session.user.organization_id,
          key: "organization_settings",
        },
      },
      select: {
        id: true,
        organization_id: true,
        key: true,
        value: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching organization settings:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organization_id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const json = await req.json();
    const { info, formats = {} } = json;

    const settings = await prisma.organizationSetting.upsert({
      where: {
        organization_id_key: {
          organization_id: session.user.organization_id,
          key: "organization_settings",
        },
      },
      update: {
        value: JSON.stringify({
          name: info.name,
          email: info.email,
          phone: info.phone,
          website: info.website,
          address: info.address,
          caseNumberFormat: formats.caseNumberFormat || "",
          evidenceNumberFormat: formats.evidenceNumberFormat || "",
          storageNumberFormat: formats.storageNumberFormat || "",
        }),
      },
      create: {
        organization_id: session.user.organization_id,
        key: "organization_settings",
        value: JSON.stringify({
          name: info.name,
          email: info.email,
          phone: info.phone,
          website: info.website,
          address: info.address,
          caseNumberFormat: formats.caseNumberFormat || "",
          evidenceNumberFormat: formats.evidenceNumberFormat || "",
          storageNumberFormat: formats.storageNumberFormat || "",
        }),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        resourceType: "ORGANIZATION_SETTINGS",
        resourceId: settings.id.toString(),
        details: json,
        user_id: session.user.id,
        organization_id: session.user.organization_id,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating organization settings:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}