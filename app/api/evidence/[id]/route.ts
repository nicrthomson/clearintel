import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptData } from "@/lib/crypto";

// Helper function to handle BigInt serialization
function serializeEvidence(evidence: any) {
  return {
    ...evidence,
    size: evidence.size ? evidence.size.toString() : null,
    createdAt: evidence.createdAt.toISOString(),
    updatedAt: evidence.updatedAt.toISOString(),
    customFields: evidence.customFields?.map((cf: any) => ({
      ...cf,
      createdAt: cf.createdAt.toISOString(),
      updatedAt: cf.updatedAt.toISOString(),
    })),
    chainOfCustody: evidence.chainOfCustody?.map((cc: any) => ({
      ...cc,
      createdAt: cc.createdAt.toISOString(),
      updatedAt: cc.updatedAt.toISOString(),
    })),
  };
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const evidence = await prisma.evidence.findUnique({
      where: {
        id: parseInt(params.id),
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
    });

    if (!evidence) {
      return new NextResponse("Evidence not found", { status: 404 });
    }

    return NextResponse.json(serializeEvidence(evidence));
  } catch (error) {
    console.error("[EVIDENCE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const {
      name,
      description,
      location,
      storageLocation,
      status,
      customFields,
    } = json;

    // Update evidence record
    const evidence = await prisma.evidence.update({
      where: {
        id: parseInt(params.id),
      },
      data: {
        name,
        description,
        location,
        storageLocation,
        status,
      },
    });

    // Update custom fields if provided
    if (customFields && customFields.length > 0) {
      // Delete existing custom fields
      await prisma.evidenceCustomField.deleteMany({
        where: {
          evidence_id: parseInt(params.id),
        },
      });

      // Create new custom fields
      await prisma.evidenceCustomField.createMany({
        data: customFields.map((field: any) => ({
          evidence_id: parseInt(params.id),
          field_id: parseInt(field.field_id),
          value: field.value,
        })),
      });
    }

    // Create chain of custody record for the update
    const signature = encryptData(JSON.stringify({
      user: session.user.id,
      action: "Updated",
      timestamp: new Date().toISOString(),
    }));

    await prisma.chainOfCustody.create({
      data: {
        evidence_id: parseInt(params.id),
        user_id: session.user.id,
        action: "Updated",
        reason: "Evidence details updated",
        location: storageLocation,
        signature,
      },
    });

    return NextResponse.json(serializeEvidence(evidence));
  } catch (error) {
    console.error("[EVIDENCE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get evidence details before deletion
    const evidence = await prisma.evidence.findUnique({
      where: {
        id: parseInt(params.id),
      },
    });

    if (!evidence) {
      return new NextResponse("Evidence not found", { status: 404 });
    }

    // Delete evidence
    await prisma.evidence.delete({
      where: {
        id: parseInt(params.id),
      },
    });

    // Update case evidence count and storage total
    await prisma.case.update({
      where: { id: evidence.case_id },
      data: {
        evidenceCount: { decrement: 1 },
        storageTotal: evidence.size ? { decrement: Number(evidence.size) } : undefined,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[EVIDENCE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
