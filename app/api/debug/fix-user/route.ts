import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const defaultEvidenceTypes = [
  { name: "Hard Drive", description: "Physical hard disk drives" },
  { name: "SSD", description: "Solid state drives" },
  { name: "USB Drive", description: "USB flash drives and external storage" },
  { name: "Mobile Device", description: "Smartphones, tablets, and other mobile devices" },
  { name: "Computer", description: "Desktop and laptop computers" },
  { name: "Memory Card", description: "SD cards, memory sticks, and other removable storage" },
  { name: "Network Storage", description: "NAS devices and network storage" },
  { name: "Cloud Storage", description: "Cloud storage accounts and backups" },
  { name: "Email Account", description: "Email accounts and archives" },
  { name: "Social Media", description: "Social media accounts and data" },
  { name: "Document", description: "Physical or digital documents" },
  { name: "Image", description: "Digital images and photographs" },
  { name: "Video", description: "Digital video files" },
  { name: "Audio", description: "Digital audio files" },
  { name: "Other", description: "Other types of digital evidence" },
];

async function createDefaultEvidenceTypes(organizationId: number) {
  console.log("[FIX_USER] Creating default evidence types for organization:", organizationId);
  
  // Check if organization already has evidence types
  const count = await prisma.evidenceType.count({
    where: { organization_id: organizationId },
  });

  if (count > 0) {
    console.log("[FIX_USER] Organization already has evidence types");
    return;
  }

  try {
    await prisma.evidenceType.createMany({
      data: defaultEvidenceTypes.map(type => ({
        ...type,
        organization_id: organizationId,
      })),
    });
    console.log("[FIX_USER] Default evidence types created successfully");
  } catch (error) {
    console.error("[FIX_USER] Error creating evidence types:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("[FIX_USER] Session:", JSON.stringify(session, null, 2));

    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    // Try to find or create the user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        organization: {
          include: {
            evidenceTypes: true,
          },
        },
      },
    });

    // If user doesn't exist, create them
    if (!user) {
      console.log("[FIX_USER] Creating new user");
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || '',
          password: '', // You might want to set this to a random string
          role: 'ADMIN',
        },
        include: {
          organization: {
            include: {
              evidenceTypes: true,
            },
          },
        },
      });
    }

    let organizationId = user.organization_id;

    if (!organizationId) {
      console.log("[FIX_USER] Creating new organization");
      const organization = await prisma.organization.create({
        data: {
          name: `${user.name || user.email}'s Organization`,
          email: user.email,
          users: {
            connect: { id: user.id },
          },
        },
      });
      organizationId = organization.id;

      // Update user with organization
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          organization_id: organizationId,
          role: "ADMIN"
        },
      });
    }

    await createDefaultEvidenceTypes(organizationId);

    const updatedUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        organization: {
          include: {
            evidenceTypes: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "User fixed successfully",
      user: updatedUser,
      organization_id: organizationId,
      evidenceTypeCount: updatedUser?.organization?.evidenceTypes.length || 0,
      needsRelogin: true,
    });

  } catch (error) {
    console.error("[FIX_USER] Error:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal Error", 
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
