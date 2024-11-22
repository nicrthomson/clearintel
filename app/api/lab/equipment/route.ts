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
    const equipment = await prisma.equipment.findMany({
      where: {
        organization_id: session.user.organization_id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
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
    const equipment = await prisma.equipment.create({
      data: {
        name: json.name,
        type: json.type,
        serialNumber: json.serialNumber,
        status: json.status,
        location: json.location,
        lastCalibration: json.lastCalibration ? new Date(json.lastCalibration) : null,
        nextCalibration: json.nextCalibration ? new Date(json.nextCalibration) : null,
        lastMaintenance: json.lastMaintenance ? new Date(json.lastMaintenance) : null,
        nextMaintenance: json.nextMaintenance ? new Date(json.nextMaintenance) : null,
        notes: json.notes,
        organization_id: session.user.organization_id,
      }
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error creating equipment:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
