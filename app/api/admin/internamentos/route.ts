import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chip = searchParams.get("chip");

    const internamentos = await prisma.fichaInternamento.findMany({
      where: chip ? { chip } : undefined,
      orderBy: { id: "desc" },
    });
    return NextResponse.json(internamentos);
  } catch (error) {
    console.error("Error fetching internamentos:", error);
    return NextResponse.json(
      { error: "Failed to fetch internamentos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, raca, data, temperamento, idade, peso, motivo, chip } = body;

    const newFicha = await prisma.fichaInternamento.create({
      data: {
        nome,
        raca,
        data: data ? new Date(data) : new Date(),
        temperamento,
        idade: Number(idade),
        peso: Number(peso),
        motivo,
        chip,
      },
    });

    return NextResponse.json(newFicha, { status: 201 });
  } catch (error) {
    console.error("Error creating internamento:", error);
    return NextResponse.json(
      { error: "Failed to create internamento" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nome, raca, data, temperamento, idade, peso, motivo, chip } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const updatedFicha = await prisma.fichaInternamento.update({
      where: { id: Number(id) },
      data: {
        nome,
        raca,
        data: data ? new Date(data) : undefined,
        temperamento,
        idade: idade !== undefined ? Number(idade) : undefined,
        peso: peso !== undefined ? Number(peso) : undefined,
        motivo,
        chip,
      },
    });

    return NextResponse.json(updatedFicha);
  } catch (error) {
    console.error("Error updating internamento:", error);
    return NextResponse.json(
      { error: "Failed to update internamento" },
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

    // Delete associated tratamentos first due to foreign key
    // The schema has `internamento Int`, so we delete Tratamento where `internamento: id`
    await prisma.tratamento.deleteMany({
      where: { internamento: Number(id) },
    });

    await prisma.fichaInternamento.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting internamento:", error);
    return NextResponse.json(
      { error: "Failed to delete internamento" },
      { status: 500 }
    );
  }
}
