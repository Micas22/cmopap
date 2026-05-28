import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { writeFile, mkdir } from "fs/promises";
import path from "path";

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
    const formData = await request.formData();
    const medicacao = formData.get("medicacao") as string;
    const dose = formData.get("dose") as string;
    const dia = formData.get("dia") as string;
    const internamento = formData.get("internamento") as string;
    const arquivos = formData.getAll("arquivos") as File[];

    if (!medicacao || !dose || !dia || !internamento) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let arquivosPath = "";
    if (arquivos && arquivos.length > 0) {
      const uploadDir = path.join(process.cwd(), "public/uploads");

      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {}

      const filenameList: string[] = [];
      for (const arquivo of arquivos) {
        if (arquivo.size > 0) {
          const bytes = await arquivo.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const filename = `${Date.now()}-${arquivo.name.replace(/\\s/g, "-")}`;
          await writeFile(path.join(uploadDir, filename), buffer);
          filenameList.push(`/uploads/${filename}`);
        }
      }
      arquivosPath = filenameList.join(",");
    }

    const newTratamento = await prisma.tratamento.create({
      data: {
        medicacao,
        dose,
        dia: new Date(dia),
        internamento: Number(internamento),
        arquivos: arquivosPath,
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

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = Number(formData.get("id"));
    const arquivos = formData.getAll("arquivos") as File[];

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const existingTratamento = await prisma.tratamento.findUnique({
      where: { id },
    });

    if (!existingTratamento) {
      return NextResponse.json({ error: "Tratamento not found" }, { status: 404 });
    }

    let arquivosPath = existingTratamento.arquivos || "";
    if (arquivos && arquivos.length > 0) {
      const uploadDir = path.join(process.cwd(), "public/uploads");

      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {}

      const filenameList: string[] = [];
      for (const arquivo of arquivos) {
        if (arquivo.size > 0) {
          const bytes = await arquivo.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const filename = `${Date.now()}-${arquivo.name.replace(/\\s/g, "-")}`;
          await writeFile(path.join(uploadDir, filename), buffer);
          filenameList.push(`/uploads/${filename}`);
        }
      }
      
      const newFilesStr = filenameList.join(",");
      if (arquivosPath && newFilesStr) {
        arquivosPath = `${arquivosPath},${newFilesStr}`;
      } else if (newFilesStr) {
        arquivosPath = newFilesStr;
      }
    }

    const updatedTratamento = await prisma.tratamento.update({
      where: { id },
      data: {
        arquivos: arquivosPath,
      },
    });

    return NextResponse.json(updatedTratamento);
  } catch (error) {
    console.error("Error updating tratamento:", error);
    return NextResponse.json(
      { error: "Failed to update tratamento" },
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
