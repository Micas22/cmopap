import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeBigInt(obj: any): any {
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj === "object" && obj !== null) {
    if (Array.isArray(obj)) {
      return obj.map(serializeBigInt);
    }
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeBigInt(value);
    }
    return result;
  }
  return typeof obj === "bigint" ? String(obj) : obj;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    const aconselhamentos = await prisma.aconselhamentos.findMany({
      orderBy: { id: "desc" },
      take: limit ? Number(limit) : undefined,
      include: {
        Animal: true
      }
    });
    return NextResponse.json(serializeBigInt(aconselhamentos));
  } catch (error) {
    console.error("Error fetching aconselhamentos:", error);
    return NextResponse.json(
      { error: "Failed to fetch aconselhamentos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, nome, animal, motivo, administracao, feedback, local } = body;

    if (!data || !motivo) {
      return NextResponse.json(
        { error: "Data and motivo are required" },
        { status: 400 }
      );
    }

    const date = new Date(data);
    if (isNaN(date.getTime()) || data.split('-').length !== 3) {
      return NextResponse.json(
        { error: "Data inválida. Use formato YYYY-MM-DD" },
        { status: 400 }
      );
    }


    let animalId = null;
    if (animal) {
      const animalExists = await prisma.animal.findUnique({ where: { id: Number(animal) } });
      if (!animalExists) {
        return NextResponse.json(
          { error: "Invalid animal ID" },
          { status: 400 }
        );
      }
      animalId = Number(animal);
    }

    const newAconselhamento = await prisma.aconselhamentos.create({
      data: {
        data: new Date(data),
        nome,
        animal: animalId,
        motivo,
        administracao: administracao || null,
        feedback: feedback || null,
        local: local || null,
      },
    });

    return NextResponse.json(serializeBigInt(newAconselhamento), { status: 201 });
  } catch (error) {
    console.error("Error creating aconselhamento:", error);
    return NextResponse.json(
      { error: "Failed to create aconselhamento" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, data, nome, animal, motivo, administracao, feedback, local } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    let animalId = null;
    if (animal !== undefined && animal !== null) {
      const animalExists = await prisma.animal.findUnique({ where: { id: Number(animal) } });
      if (!animalExists) {
        return NextResponse.json(
          { error: "Invalid animal ID" },
          { status: 400 }
        );
      }
      animalId = Number(animal);
    }

    const updateData: any = {};
    if (data !== undefined) {
      const date = new Date(data);
      if (isNaN(date.getTime()) || data.split('-').length !== 3) {
        return NextResponse.json(
          { error: "Data inválida. Use formato YYYY-MM-DD" },
          { status: 400 }
        );
      }
      updateData.data = date;
    }
    if (nome !== undefined) updateData.nome = nome || null;
    if (animal !== undefined) updateData.animal = animalId;
    if (motivo !== undefined) updateData.motivo = motivo || null;
    if (administracao !== undefined) updateData.administracao = administracao || null;
    if (feedback !== undefined) updateData.feedback = feedback || null;
    if (local !== undefined) updateData.local = local || null;

    const updatedAconselhamento = await prisma.aconselhamentos.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    return NextResponse.json(serializeBigInt(updatedAconselhamento));
  } catch (error) {
    console.error("Error updating aconselhamento:", error);
    return NextResponse.json(
      { error: "Failed to update aconselhamento" },
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

    await prisma.aconselhamentos.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting aconselhamento:", error);
    return NextResponse.json(
      { error: "Failed to delete aconselhamento" },
      { status: 500 }
    );
  }
}

