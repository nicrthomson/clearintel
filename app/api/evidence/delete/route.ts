import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";
import { UPLOADS_DIR } from "@/lib/files";

interface EvidenceItem {
  id: number;
  filePath: string | null;
  case_id: number;
  size: bigint | null;
}

interface CaseTotal {
  count: number;
  size: number; // Changed from bigint to number
}

interface CaseTotals {
  [key: string]: CaseTotal;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const { ids } = json;

    if (!Array.isArray(ids) || ids.length === 0) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    // Get evidence items to delete
    const evidenceItems = await prisma.evidence.findMany({
      where: {
        id: { in: ids },
        case: {
          user_id: session.user.id,
        },
      },
      select: {
        id: true,
        filePath: true,
        case_id: true,
        size: true,
      },
    });

    if (evidenceItems.length === 0) {
      return new NextResponse("No items found", { status: 404 });
    }

    // Delete files
    for (const item of evidenceItems) {
      if (item.filePath) {
        const fileName = item.filePath.split("/").pop();
        if (fileName) {
          try {
            await unlink(join(UPLOADS_DIR, fileName));
          } catch (error) {
            console.error("Failed to delete file: " + fileName, error);
          }
        }
      }
    }

    // Group items by case for updating case totals
    const caseTotals: CaseTotals = {};
    
    evidenceItems.forEach((item: EvidenceItem) => {
      const caseId = item.case_id.toString();
      if (!caseTotals[caseId]) {
        caseTotals[caseId] = {
          count: 0,
          size: 0,
        };
      }
      caseTotals[caseId].count += 1;
      // Convert BigInt to number for the total
      caseTotals[caseId].size += item.size ? Number(item.size) : 0;
    });

    // Update case totals and delete evidence in a transaction
    await prisma.$transaction([
      // Update case totals
      ...Object.entries(caseTotals).map(([caseId, totals]) =>
        prisma.case.update({
          where: { id: parseInt(caseId) },
          data: {
            evidenceCount: { decrement: totals.count },
            storageTotal: { decrement: totals.size },
          },
        })
      ),
      // Delete evidence items
      prisma.evidence.deleteMany({
        where: {
          id: { in: ids },
          case: {
            user_id: session.user.id,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      deletedCount: evidenceItems.length,
    });
  } catch (error) {
    console.error("[EVIDENCE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
