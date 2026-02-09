import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    const ocorrencias = await prisma.ocorrencia.findMany({
      orderBy: { id: "desc" },
      take: limit && !isNaN(Number(limit)) ? Number(limit) : undefined,
    });
    return NextResponse.json(ocorrencias);
  } catch (error) {
    console.error("Error fetching ocorrencias:", error);
    return NextResponse.json(
      { error: "Failed to fetch ocorrencias" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { titulo, descricao, morada, data_criacao, data_resolucao, estado } = await request.json();

    if (!titulo || !descricao || !morada || !data_criacao || estado === undefined || estado === null || isNaN(Number(estado))) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios: titulo, descricao, morada, data_criacao, estado" },
        { status: 400 }
      );
    }

    const newOcorrencia = await prisma.ocorrencia.create({
      data: {
        titulo,
        descricao,
        morada,
        data_criacao: new Date(data_criacao),
        data_resolucao: data_resolucao ? new Date(data_resolucao) : null,
        estado: Number(estado),
      },
    });

    return NextResponse.json(newOcorrencia, { status: 201 });
  } catch (error) {
    console.error("Error creating ocorrencia:", error);
    return NextResponse.json(
      { error: "Failed to create ocorrencia" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, titulo, descricao, morada, data_criacao, data_resolucao, estado } = await request.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID é obrigatório e deve ser um número" }, { status: 400 });
    }

    const data: any = {};
    if (titulo) data.titulo = titulo;
    if (descricao) data.descricao = descricao;
    if (morada) data.morada = morada;
    if (data_criacao) data.data_criacao = new Date(data_criacao);
    if (data_resolucao) data.data_resolucao = new Date(data_resolucao);
    if (estado !== undefined && estado !== null && !isNaN(Number(estado))) data.estado = Number(estado);

    const updatedOcorrencia = await prisma.ocorrencia.update({
      where: { id: Number(id) },
      data,
    });

    return NextResponse.json(updatedOcorrencia);
  } catch (error) {
    console.error("Error updating ocorrencia:", error);
    return NextResponse.json(
      { error: "Failed to update ocorrencia" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID é obrigatório e deve ser um número" }, { status: 400 });
    }

    await prisma.ocorrencia.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ocorrencia:", error);
    return NextResponse.json(
      { error: "Failed to delete ocorrencia" },
      { status: 500 }
    );
  }
}
