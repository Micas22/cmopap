import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const coloniaId = Number(resolvedParams.id);

    if (isNaN(coloniaId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const animais = await prisma.animal.findMany({
      where: {
        colonia: coloniaId,
      },
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        nome: true,
        sex: true,
        esterelizacao: true,
        raca: true,
      },
    });

    const formattedAnimais = animais.map(animal => ({
      id: animal.id,
      nome: animal.nome,
      sexo: animal.sex === 1 ? 'Macho' : animal.sex === 0 ? 'Fêmea' : undefined,
      esterilizado: animal.esterelizacao === 1 ? true : animal.esterelizacao === 0 ? false : undefined,
      especie: animal.raca || undefined,
    }));

    return NextResponse.json(formattedAnimais);
  } catch (error) {
    console.error("Error fetching animais for colonia:", error);
    return NextResponse.json(
      { error: "Failed to fetch animais" },
      { status: 500 }
    );
  }
}
