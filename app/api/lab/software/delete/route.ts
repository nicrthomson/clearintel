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
    const { ids } = json;

    if (!Array.isArray(ids) || ids.length === 0) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    // Delete licenses
    await prisma.softwareLicense.deleteMany({
      where: {
        id: { in: ids },
        organization_id: session.user.organization_id,
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: ids.length,
    });
  } catch (error) {
    console.error("[SOFTWARE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
