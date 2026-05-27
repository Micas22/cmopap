import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const registos = await prisma.registoEntradaSaida.findMany({
      orderBy: { data: "desc" },
    });
    return NextResponse.json(registos);
  } catch (error) {
    console.error("GET /api/admin/registoensai error:", error);
    return NextResponse.json({ error: "Erro ao obter registos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, telefone, nome, motivo } = body;

    if (!telefone || !nome || !motivo) {
      return NextResponse.json({ error: "Campos obrigatórios em falta" }, { status: 400 });
    }

    const registo = await prisma.registoEntradaSaida.create({
      data: {
        data: data ? new Date(data) : new Date(),
        telefone,
        nome,
        motivo,
      },
    });
    return NextResponse.json(registo, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/registoensai error:", error);
    return NextResponse.json({ error: "Erro ao criar registo" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, data, telefone, nome, motivo } = body;

    if (!id || !telefone || !nome || !motivo) {
      return NextResponse.json({ error: "Campos obrigatórios em falta" }, { status: 400 });
    }

    const registo = await prisma.registoEntradaSaida.update({
      where: { id: Number(id) },
      data: {
        data: data ? new Date(data) : undefined,
        telefone,
        nome,
        motivo,
      },
    });
    return NextResponse.json(registo);
  } catch (error) {
    console.error("PUT /api/admin/registoensai error:", error);
    return NextResponse.json({ error: "Erro ao atualizar registo" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID em falta" }, { status: 400 });
    }

    await prisma.registoEntradaSaida.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/registoensai error:", error);
    return NextResponse.json({ error: "Erro ao eliminar registo" }, { status: 500 });
  }
}
