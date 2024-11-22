import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organization_id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const json = await req.json();
    const equipment = await prisma.$executeRaw`
      UPDATE equipment 
      SET 
        name = ${json.name},
        type = ${json.type},
        serial_number = ${json.serialNumber},
        status = ${json.status},
        location = ${json.location},
        last_calibration = ${json.lastCalibration},
        next_calibration = ${json.nextCalibration},
        last_maintenance = ${json.lastMaintenance},
        next_maintenance = ${json.nextMaintenance},
        notes = ${json.notes},
        updated_at = NOW()
      WHERE id = ${parseInt(params.id)}
      AND organization_id = ${session.user.organization_id}
      RETURNING *
    `;

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error updating equipment:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organization_id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await prisma.$executeRaw`
      DELETE FROM equipment 
      WHERE id = ${parseInt(params.id)}
      AND organization_id = ${session.user.organization_id}
    `;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
