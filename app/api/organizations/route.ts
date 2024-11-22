import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as db from "@/lib/db/organizations";

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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!session.user.organization_id) {
      return new NextResponse("No organization associated with user", {
        status: 400,
      });
    }

    const org = await db.getOrganizationById(session.user.organization_id);
    if (!org) {
      return new NextResponse("Organization not found", { status: 404 });
    }

    return NextResponse.json(org);
  } catch (error) {
    console.error("[ORGANIZATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const org = await db.createOrganization(json);

    // Create default evidence types
    await Promise.all(
      defaultEvidenceTypes.map(type =>
        db.createEvidenceType(org.id, type)
      )
    );

    return NextResponse.json(org);
  } catch (error) {
    console.error("[ORGANIZATIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!session.user.organization_id) {
      return new NextResponse("No organization associated with user", {
        status: 400,
      });
    }

    const org = await db.getOrganizationById(session.user.organization_id);
    if (!org) {
      return new NextResponse("Organization not found", { status: 404 });
    }

    const json = await req.json();
    const updatedOrg = await db.updateOrganization(org.id, json);

    return NextResponse.json(updatedOrg);
  } catch (error) {
    console.error("[ORGANIZATIONS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
