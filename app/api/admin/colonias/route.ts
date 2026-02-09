import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const colonias = await prisma.colonia.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(colonias);
  } catch (error) {
    console.error("Error fetching colonias:", error);
    return NextResponse.json(
      { error: "Failed to fetch colonias" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, responsavel, contacto, num_animais, longitude, latitude } = body;

    if (!nome || !responsavel || !contacto || num_animais === undefined || longitude === undefined || latitude === undefined) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const newColonia = await prisma.colonia.create({
      data: {
        nome,
        responsavel,
        contacto,
        num_animais: Number(num_animais),
        longitude: Number(longitude),
        latitude: Number(latitude),
      },
    });

    return NextResponse.json(newColonia, { status: 201 });
  } catch (error) {
    console.error("Error creating colonia:", error);
    return NextResponse.json(
      { error: "Failed to create colonia" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nome, responsavel, contacto, num_animais, longitude, latitude } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    if (!nome || !responsavel || !contacto || num_animais === undefined || longitude === undefined || latitude === undefined) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const updatedColonia = await prisma.colonia.update({
      where: { id: Number(id) },
      data: {
        nome,
        responsavel,
        contacto,
        num_animais: Number(num_animais),
        longitude: Number(longitude),
        latitude: Number(latitude),
      },
    });

    return NextResponse.json(updatedColonia);
  } catch (error) {
    console.error("Error updating colonia:", error);
    return NextResponse.json(
      { error: "Failed to update colonia" },
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

    await prisma.colonia.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting colonia:", error);
    return NextResponse.json(
      { error: "Failed to delete colonia" },
      { status: 500 }
    );
  }
}
