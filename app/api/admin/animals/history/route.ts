import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// GET - Fetch animal history by animalId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const animalId = searchParams.get("animalId");

    if (!animalId) {
      return NextResponse.json(
        { error: "Animal ID is required" },
        { status: 400 }
      );
    }

    const history = await prisma.animalHistory.findMany({
      where: { animalid: BigInt(animalId) },
      orderBy: { created_at: "desc" },
    });

    // Convert BigInt to string for JSON serialization
    const serializedHistory = history.map((item) => ({
      ...item,
      id: item.id.toString(),
      animalid: item.animalid?.toString(),
    }));

    return NextResponse.json(serializedHistory);
  } catch (error) {
    console.error("Error fetching animal history:", error);
    return NextResponse.json(
      { error: "Failed to fetch animal history" },
      { status: 500 }
    );
  }
}

// POST - Create new animal history event
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const titulo = formData.get("titulo") as string;
    const animalIdRaw = formData.get("animalid") as string;
    const ficheiro = formData.get("ficheiro") as File | null;

    if (!titulo || !animalIdRaw) {
      return NextResponse.json(
        { error: "Title and Animal ID are required" },
        { status: 400 }
      );
    }

    const animalId = BigInt(animalIdRaw);

    let ficheiroPath = null;
    if (ficheiro && ficheiro.size > 0) {
      const bytes = await ficheiro.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${ficheiro.name.replace(/\s/g, "-")}`;
      const uploadDir = path.join(process.cwd(), "public/uploads");

      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {}

      await writeFile(path.join(uploadDir, filename), buffer);
      ficheiroPath = `/uploads/${filename}`;
    }

    const newHistory = await prisma.animalHistory.create({
      data: {
        titulo,
        animalid: animalId,
        ...(ficheiroPath ? { ficheiro: ficheiroPath } : {}),
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedHistory = {
      ...newHistory,
      id: newHistory.id.toString(),
      animalid: newHistory.animalid?.toString(),
    };

    return NextResponse.json(serializedHistory, { status: 201 });
  } catch (error) {
    console.error("Error creating animal history:", error);
    return NextResponse.json(
      { error: "Failed to create animal history" },
      { status: 500 }
    );
  }
}

// PUT - Update animal history event
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const idRaw = formData.get("id") as string;
    const titulo = formData.get("titulo") as string;
    const ficheiro = formData.get("ficheiro") as File | null;
    const deleteFile = formData.get("deleteFile") as string | null;

    if (!idRaw || !titulo) {
      return NextResponse.json(
        { error: "ID and Title are required" },
        { status: 400 }
      );
    }

    const id = BigInt(idRaw);

    const data: any = {
      titulo,
    };

    // Handle file upload
    if (ficheiro && ficheiro.size > 0) {
      const bytes = await ficheiro.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${ficheiro.name.replace(/\s/g, "-")}`;
      const uploadDir = path.join(process.cwd(), "public/uploads");

      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {}

      await writeFile(path.join(uploadDir, filename), buffer);
      data.ficheiro = `/uploads/${filename}`;
    } else if (deleteFile === "true") {
      data.ficheiro = null;
    }

    const updatedHistory = await prisma.animalHistory.update({
      where: { id },
      data,
    });

    // Convert BigInt to string for JSON serialization
    const serializedHistory = {
      ...updatedHistory,
      id: updatedHistory.id.toString(),
      animalid: updatedHistory.animalid?.toString(),
    };

    return NextResponse.json(serializedHistory);
  } catch (error) {
    console.error("Error updating animal history:", error);
    return NextResponse.json(
      { error: "Failed to update animal history" },
      { status: 500 }
    );
  }
}

// DELETE - Delete animal history event
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    await prisma.animalHistory.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting animal history:", error);
    return NextResponse.json(
      { error: "Failed to delete animal history" },
      { status: 500 }
    );
  }
}
