import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface EvidenceType {
  id: number;
  name: string;
  description: string | null;
  organization_id: number;
  createdAt: Date;
  updatedAt: Date;
}

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
] as const;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const { name, description } = json;

    if (!session.user.organization_id) {
      return new NextResponse("Organization ID is required", { status: 400 });
    }

    const evidenceType = await prisma.evidenceType.create({
      data: {
        name,
        description,
        organization_id: session.user.organization_id,
      },
    });

    return NextResponse.json(evidenceType);
  } catch (error) {
    console.error("[EVIDENCE_TYPE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  console.log("[EVIDENCE_TYPES_GET] Starting request");
  
  try {
    const session = await getServerSession(authOptions);
    console.log("[EVIDENCE_TYPES_GET] Session:", {
      authenticated: !!session,
      userId: session?.user?.id,
      organizationId: session?.user?.organization_id,
    });
    
    if (!session) {
      console.log("[EVIDENCE_TYPES_GET] No session found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!session.user.organization_id) {
      console.log("[EVIDENCE_TYPES_GET] No organization ID found");
      return new NextResponse("Organization ID is required", { status: 400 });
    }

    // First check if there are any evidence types
    const count = await prisma.evidenceType.count({
      where: {
        organization_id: session.user.organization_id,
      },
    });
    console.log("[EVIDENCE_TYPES_GET] Current count:", count);

    // If no types exist, create the default ones
    if (count === 0) {
      console.log("[EVIDENCE_TYPES_GET] Creating default types");
      try {
        await prisma.evidenceType.createMany({
          data: defaultEvidenceTypes.map(type => ({
            ...type,
            organization_id: session.user.organization_id!,
          })),
        });
        console.log("[EVIDENCE_TYPES_GET] Default types created successfully");
      } catch (error) {
        console.error("[EVIDENCE_TYPES_GET] Error creating default types:", error);
        throw error;
      }
    }

    // Get all evidence types
    const evidenceTypes = await prisma.evidenceType.findMany({
      where: {
        organization_id: session.user.organization_id,
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log("[EVIDENCE_TYPES_GET] Found types:", {
      count: evidenceTypes.length,
      types: evidenceTypes.map((t: EvidenceType) => t.name),
    });

    return NextResponse.json(evidenceTypes);
  } catch (error) {
    console.error("[EVIDENCE_TYPES_GET] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
