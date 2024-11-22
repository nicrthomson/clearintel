import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("[DEBUG_SESSION] Raw session:", JSON.stringify(session, null, 2));

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: "No session found",
      });
    }

    // Get full user details from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        organization: {
          include: {
            evidenceTypes: true,
          },
        },
      },
    });

    console.log("[DEBUG_SESSION] Database user:", JSON.stringify(user, null, 2));

    const response = {
      authenticated: true,
      session,
      databaseUser: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization_id: user.organization_id,
        organization: user.organization ? {
          id: user.organization.id,
          name: user.organization.name,
          evidenceTypeCount: user.organization.evidenceTypes.length,
        } : null,
      } : null,
      message: "Current session and database state",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[DEBUG_SESSION]", error);
    return NextResponse.json({
      error: "Failed to get session",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
