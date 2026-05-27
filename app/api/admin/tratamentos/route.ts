import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const internamentoId = searchParams.get("internamentoId");

    const tratamentos = await prisma.tratamento.findMany({
      where: internamentoId ? { internamento: Number(internamentoId) } : undefined,
      orderBy: { id: "asc" },
    });
    return NextResponse.json(tratamentos);
  } catch (error) {
    console.error("Error fetching tratamentos:", error);
    return NextResponse.json(
      { error: "Failed to fetch tratamentos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { medicacao, dose, dia, internamento } = body;

    if (!medicacao || !dose || !dia || !internamento) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTratamento = await prisma.tratamento.create({
      data: {
        medicacao,
        dose,
        dia: new Date(dia),
        internamento: Number(internamento),
      },
    });

    return NextResponse.json(newTratamento, { status: 201 });
  } catch (error) {
    console.error("Error creating tratamento:", error);
    return NextResponse.json(
      { error: "Failed to create tratamento" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    await prisma.tratamento.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tratamento:", error);
    return NextResponse.json(
      { error: "Failed to delete tratamento" },
      { status: 500 }
    );
  }
}
