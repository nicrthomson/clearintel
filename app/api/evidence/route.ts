import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptData } from "@/lib/crypto";

// Helper function to serialize BigInt
function serializeBigInt(data: any): any {
  return JSON.parse(JSON.stringify(data, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const {
      name,
      description,
      evidenceNumber,
      type_id,
      case_id,
      location,
      storageLocation,
      md5Hash,
      sha256Hash,
      acquisitionDate,
      size,
      customFields,
      filePath,
      originalName,
      mimeType,
    } = json;

    // Create evidence record
    const evidence = await prisma.evidence.create({
      data: {
        name,
        description,
        evidenceNumber: evidenceNumber || `EV-${Date.now()}`,
        case: {
          connect: { id: parseInt(case_id) }
        },
        type: {
          connect: { id: parseInt(type_id) }
        },
        location,
        storageLocation,
        md5Hash,
        sha256Hash,
        acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : null,
        size: size ? BigInt(size) : null,
        filePath,
        originalName,
        mimeType,
        status: "In Custody",
      },
      include: {
        type: true,
        customFields: true,
        chainOfCustody: true,
      },
    });

    // Create custom field values if provided
    if (customFields && customFields.length > 0) {
      await prisma.evidenceCustomField.createMany({
        data: customFields.map((field: any) => ({
          evidence_id: evidence.id,
          field_id: parseInt(field.field_id),
          value: field.value,
        })),
      });
    }

    // Create initial chain of custody record
    const signature = encryptData(JSON.stringify({
      user: session.user.id,
      action: "Created",
      timestamp: new Date().toISOString(),
    }));

    await prisma.chainOfCustody.create({
      data: {
        evidence_id: evidence.id,
        user_id: session.user.id,
        action: "Created",
        reason: "Initial evidence creation",
        location: storageLocation,
        signature,
      },
    });

    // Update case evidence count and storage total
    // Convert BigInt to number for increment operation
    const sizeNumber = size ? Number(size) : 0;
    await prisma.case.update({
      where: { id: parseInt(case_id) },
      data: {
        evidenceCount: { increment: 1 },
        storageTotal: { increment: sizeNumber },
      },
    });

    // Add audit log for evidence creation
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        resourceType: "EVIDENCE",
        resourceId: evidence.id.toString(),
        details: {
          name,
          description,
          caseId: parseInt(case_id)
        },
        user_id: session.user.id,
        organization_id: session.user.organization_id || 0,
      },
    });

    // Serialize the response to handle BigInt
    const serializedEvidence = serializeBigInt(evidence);
    return NextResponse.json(serializedEvidence);
  } catch (error) {
    console.error("[EVIDENCE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const case_id = searchParams.get("case_id");
    
    if (!case_id) {
      return new NextResponse("Case ID is required", { status: 400 });
    }

    const evidence = await prisma.evidence.findMany({
      where: {
        case_id: parseInt(case_id),
      },
      include: {
        type: true,
        customFields: {
          include: {
            field: true,
          },
        },
        chainOfCustody: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Serialize the response to handle BigInt
    const serializedEvidence = serializeBigInt(evidence);
    return NextResponse.json(serializedEvidence);
  } catch (error) {
    console.error("[EVIDENCE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
