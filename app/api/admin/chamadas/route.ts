import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const chamadas = await prisma.chamadas.findMany({
      orderBy: { data: "desc" },
    });
    return NextResponse.json(chamadas);
  } catch (error) {
    console.error("GET /api/admin/chamadas error:", error);
    return NextResponse.json({ error: "Erro ao obter chamadas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, telefone, nome, motivo, resposta } = body;

    if (!telefone || !nome || !motivo) {
      return NextResponse.json({ error: "Campos obrigatórios em falta" }, { status: 400 });
    }

    const chamada = await prisma.chamadas.create({
      data: {
        data: data ? new Date(data) : new Date(),
        telefone,
        nome,
        motivo,
        resposta: resposta || "",
      },
    });
    return NextResponse.json(chamada, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/chamadas error:", error);
    return NextResponse.json({ error: "Erro ao criar chamada" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, data, telefone, nome, motivo, resposta } = body;

    if (!id || !telefone || !nome || !motivo) {
      return NextResponse.json({ error: "Campos obrigatórios em falta" }, { status: 400 });
    }

    const chamada = await prisma.chamadas.update({
      where: { id: Number(id) },
      data: {
        data: data ? new Date(data) : undefined,
        telefone,
        nome,
        motivo,
        resposta: resposta || "",
      },
    });
    return NextResponse.json(chamada);
  } catch (error) {
    console.error("PUT /api/admin/chamadas error:", error);
    return NextResponse.json({ error: "Erro ao atualizar chamada" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID em falta" }, { status: 400 });
    }

    await prisma.chamadas.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/chamadas error:", error);
    return NextResponse.json({ error: "Erro ao eliminar chamada" }, { status: 500 });
  }
}
