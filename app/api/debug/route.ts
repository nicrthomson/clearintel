import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.auditLog.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  
  return NextResponse.json(logs);
} 