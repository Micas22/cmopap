import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [residentes, colonias, esterilizados, vacinados, acolhimento] = await Promise.all([
      // All animals in the shelter
      prisma.animal.count(),
      // Animals assigned to a colony
      prisma.animal.count({ where: { colonia: { not: null } } }),
      // Sterilized animals (esterelizacao != null and != 0)
      prisma.animal.count({ where: { esterelizacao: { not: null, gt: 0 } } }),
      // Vaccinated animals (data_ultima_vacina is not null)
      prisma.animal.count({ where: { data_ultima_vacina: { not: null } } }),
      // Acolhimento: animals where acolhido === true
      prisma.animal.count({ where: { acolhido: true } }),
    ]);

    return NextResponse.json({
      residentes,
      colonias,
      esterilizados,
      vacinados,
      acolhimento,
    });
  } catch (err) {
    console.error("[stats] error:", err);
    return NextResponse.json(
      { residentes: 0, colonias: 0, esterilizados: 0, vacinados: 0, acolhimento: 0 },
      { status: 500 }
    );
  }
}
