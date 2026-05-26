import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [residentes, colonias, esterilizados] = await Promise.all([
      // All animals in the shelter
      prisma.animal.count(),
      // Animals assigned to a colony
      prisma.animal.count({ where: { colonia: { not: null } } }),
      // Sterilized animals (esterelizacao != null and != 0)
      prisma.animal.count({ where: { esterelizacao: { not: null, gt: 0 } } }),
    ]);

    return NextResponse.json({
      residentes,
      colonias,
      esterilizados,
      errantes: 0,
      acolhimento: 0,
    });
  } catch (err) {
    console.error("[stats] error:", err);
    return NextResponse.json(
      { residentes: 0, colonias: 0, esterilizados: 0, errantes: 0, acolhimento: 0 },
      { status: 500 }
    );
  }
}
