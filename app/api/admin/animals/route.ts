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

    if (!nome || !chip || isNaN(sex)) {
      return NextResponse.json(
        { error: "Nome, Chip and Sex are required" },
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
        ...(imagePath ? { image: imagePath } : {}),
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

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const data: any = {};
    if (nome) data.nome = nome;
    if (chip) data.chip = chip;
    if (!isNaN(sex)) data.sex = sex;

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