import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body.id);
    const acolhido = !!body.acolhido;

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const updated = await prisma.animal.update({ where: { id }, data: { acolhido } });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[animals/acolhido] error:", err);
    return NextResponse.json({ error: "Failed to update acolhido" }, { status: 500 });
  }
}
