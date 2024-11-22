import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!session.user.organization_id) {
      return new NextResponse("Organization ID is required", { status: 400 });
    }

    const json = await req.json();
    const {
      vendor,
      softwareName,
      licenseName,
      edition,
      purchaseDate,
      expireDate,
      cost,
      smsCost,
      location,
      notes,
    } = json;

    const license = await prisma.softwareLicense.create({
      data: {
        vendor,
        softwareName,
        licenseName,
        edition,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        expireDate: expireDate ? new Date(expireDate) : null,
        cost: cost ? cost : null,
        smsCost: smsCost ? smsCost : null,
        location,
        notes,
        organization_id: session.user.organization_id,
      },
    });

    return NextResponse.json(license);
  } catch (error) {
    console.error("[SOFTWARE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!session.user.organization_id) {
      return new NextResponse("Organization ID is required", { status: 400 });
    }

    const licenses = await prisma.softwareLicense.findMany({
      where: {
        organization_id: session.user.organization_id,
      },
      orderBy: {
        vendor: "asc",
      },
    });

    return NextResponse.json(licenses);
  } catch (error) {
    console.error("[SOFTWARE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
