import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    const animals = await prisma.animal.findMany({
      orderBy: { id: "desc" },
      take: limit ? Number(limit) : undefined,
    });
    return NextResponse.json(animals);
  } catch (error) {
    console.error("Error fetching animals:", error);
    return NextResponse.json(
      { error: "Failed to fetch animals" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const nome = formData.get("nome") as string;
    const chip = formData.get("chip") as string;
    const sex = Number(formData.get("sex"));
    const image = formData.get("image") as File | null;
    const raca = formData.get("raca") as string;
    const porte = formData.get("porte") ? Number(formData.get("porte")) : null;
    const altura = formData.get("altura") ? Number(formData.get("altura")) : null;
    const peso = formData.get("peso") ? Number(formData.get("peso")) : null;
    const esterelizacao = formData.get("esterelizacao") ? Number(formData.get("esterelizacao")) : null;
    const observações = formData.get("observações") as string | null;
    const data_ultima_vacina = formData.get("data_ultima_vacina") as string | null;
    const data_proxima_vacina = formData.get("data_proxima_vacina") as string | null;

    let imagePath = null;
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${image.name.replace(/\s/g, "-")}`;
      const uploadDir = path.join(process.cwd(), "public/uploads");

      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {}

      await writeFile(path.join(uploadDir, filename), buffer);
      imagePath = `/uploads/${filename}`;
    }

    if (!nome || !chip || isNaN(sex) || !raca || porte === null || isNaN(porte) || altura === null || isNaN(altura) || peso === null || isNaN(peso) || esterelizacao === null || isNaN(esterelizacao)) {
      return NextResponse.json(
        { error: "Nome, Chip, Sex, Raça, Porte, Altura, Peso and Esterilização are required" },
        { status: 400 }
      );
    }

    const existingAnimal = await prisma.animal.findUnique({
      where: { chip },
    });

    if (existingAnimal) {
      return NextResponse.json(
        { error: "Chip already exists" },
        { status: 409 }
      );
    }

    const newAnimal = await prisma.animal.create({
      data: {
        nome,
        chip,
        sex,
        raca,
        porte,
        altura,
        peso,
        esterelizacao,
        ...(imagePath ? { image: imagePath } : {}),
        ...(observações ? { observacoes: observações } : {}),
        ...(data_ultima_vacina ? { data_ultima_vacina: new Date(data_ultima_vacina) } : {}),
        ...(data_proxima_vacina ? { data_proxima_vacina: new Date(data_proxima_vacina) } : {}),
      } as any,
    });

    return NextResponse.json(newAnimal, { status: 201 });
  } catch (error) {
    console.error("Error creating animal:", error);
    return NextResponse.json(
      { error: "Failed to create animal" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = Number(formData.get("id"));
    const nome = formData.get("nome") as string;
    const chip = formData.get("chip") as string;
    const sex = Number(formData.get("sex"));
    const image = formData.get("image") as File | null;
    const raca = formData.get("raca") as string;
    const porteRaw = formData.get("porte") as string | null;
    const alturaRaw = formData.get("altura") as string | null;
    const pesoRaw = formData.get("peso") as string | null;
    const esterelizacaoRaw = formData.get("esterelizacao") as string | null;
    const observações = formData.get("observações") as string | null;
    const data_ultima_vacina = formData.get("data_ultima_vacina") as string | null;
    const data_proxima_vacina = formData.get("data_proxima_vacina") as string | null;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    if (!nome || !chip || isNaN(sex) || !raca || !porteRaw || isNaN(Number(porteRaw)) || !alturaRaw || isNaN(Number(alturaRaw)) || !pesoRaw || isNaN(Number(pesoRaw)) || !esterelizacaoRaw || isNaN(Number(esterelizacaoRaw))) {
      return NextResponse.json(
        { error: "Nome, Chip, Sex, Raça, Porte, Altura, Peso and Esterilização are required" },
        { status: 400 }
      );
    }

    const data: any = {};
    if (nome) data.nome = nome;
    if (chip) data.chip = chip;
    if (!isNaN(sex)) data.sex = sex;
    if (raca) data.raca = raca;
    data.porte = Number(porteRaw);
    data.altura = Number(alturaRaw);
    data.peso = Number(pesoRaw);
    data.esterelizacao = Number(esterelizacaoRaw);
    if (observações !== null) data.observacoes = observações || null;
    if (data_ultima_vacina) data.data_ultima_vacina = new Date(data_ultima_vacina);
    if (data_proxima_vacina) data.data_proxima_vacina = new Date(data_proxima_vacina);

    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${image.name.replace(/\s/g, "-")}`;
      const uploadDir = path.join(process.cwd(), "public/uploads");

      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {}

      await writeFile(path.join(uploadDir, filename), buffer);
      data.image = `/uploads/${filename}`;
    }

    const updatedAnimal = await prisma.animal.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedAnimal);
  } catch (error) {
    console.error("Error updating animal:", error);
    return NextResponse.json(
      { error: "Failed to update animal" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    await prisma.animal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting animal:", error);
    return NextResponse.json(
      { error: "Failed to delete animal" },
      { status: 500 }
    );
  }
}