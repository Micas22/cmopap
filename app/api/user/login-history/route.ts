import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    let history;
    try {
      history = await prisma.loginHistory.findMany({
        where: { userId: Number(userId) },
        orderBy: { created_at: "desc" } as any,
        take: 20,
      });
    } catch (e: any) {
      // Fallback if Next.js/Turbopack is caching the old Prisma client
      if (e.message && e.message.includes("created_at")) {
        history = await prisma.loginHistory.findMany({
          where: { userId: Number(userId) },
          orderBy: { createdAt: "desc" } as any,
          take: 20,
        });
      } else {
        throw e;
      }
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching login history:", error);
    return NextResponse.json(
      { error: "Failed to fetch login history", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
