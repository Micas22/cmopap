import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
export const runtime = "nodejs";
import path from "path";

const regularFont = path.join(process.cwd(), "public/fonts/Roboto-Regular.ttf");
const boldFont = path.join(process.cwd(), "public/fonts/Roboto-Bold.ttf");

// helper to keep only last 10 history entries per stock
async function trimHistory(stockId: number) {
  // @ts-ignore generated on prisma generate
  const latest = await prisma.stockHistory.findMany({
    where: { stockId },
    orderBy: { datas: "desc" },
    select: { id: true },
    take: 10,
  });

  const keepIds = latest.map((h: { id: number }) => h.id);

  // @ts-ignore generated on prisma generate
  await prisma.stockHistory.deleteMany({
    where: {
      stockId,
      id: { notIn: keepIds },
    },
  });
}

// GET all stocks (optionally with limit, ordered by newest first, or export as PDF)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const format = searchParams.get("format");
    const idsParam = searchParams.get("ids");
    const filtersParam = searchParams.get("filters");
    const sortParam = searchParams.get("sort");

    let whereClause: any = {};
    let orderBy: any = { id: "desc" };

    // Handle IDs filter
    if (idsParam) {
      const ids = idsParam.split(",").map(id => Number(id.trim())).filter(id => !isNaN(id));
      if (ids.length > 0) {
        whereClause.id = { in: ids };
      }
    }

    // Handle filters
    if (filtersParam) {
      try {
        const filters = JSON.parse(filtersParam);
        if (filters.name) {
          whereClause.nome = { contains: filters.name, mode: "insensitive" };
        }
        if (filters.quantityMin !== undefined && !isNaN(Number(filters.quantityMin))) {
          whereClause.quantidade = { ...whereClause.quantidade, gte: Number(filters.quantityMin) };
        }
        if (filters.quantityMax !== undefined && !isNaN(Number(filters.quantityMax))) {
          whereClause.quantidade = { ...whereClause.quantidade, lte: Number(filters.quantityMax) };
        }
        if (filters.user) {
          // Note: This assumes utilizador is a number, but we filter by username later
          // For now, we'll handle this in JS after fetching
        }
        if (filters.dateFrom) {
          whereClause.datas = { ...whereClause.datas, gte: new Date(filters.dateFrom) };
        }
        if (filters.dateTo) {
          whereClause.datas = { ...whereClause.datas, lte: new Date(filters.dateTo) };
        }
      } catch (e) {
        console.error("Invalid filters JSON:", e);
      }
    }

    // Handle sort
    if (sortParam) {
      const [field, direction] = sortParam.split(":");
      if (field && (direction === "asc" || direction === "desc")) {
        orderBy = { [field]: direction };
      }
    }

    let stocks = await prisma.stocks.findMany({
      where: whereClause,
      orderBy,
      take: limit ? Number(limit) : undefined,
    });

    // Additional filtering for user (since utilizador is ID, but filter is by username)
    if (filtersParam) {
      try {
        const filters = JSON.parse(filtersParam);
        if (filters.user) {
          // Fetch all users to map usernames
          // @ts-ignore generated on prisma generate
          const allUsers = await prisma.user.findMany();
          const userMap = Object.fromEntries(allUsers.map((u: any) => [u.id, u.username]));
          stocks = stocks.filter(stock => {
            const username = userMap[stock.utilizador];
            return username && username.toLowerCase().includes(filters.user.toLowerCase());
          });
        }
      } catch (e) {
        console.error("Error filtering by user:", e);
      }
    }

if (format === "pdf") {
  // generate enhanced PDF table with current stocks using pdfkit
  const doc = new PDFDocument({
    margin: 50,
    font: null,
  } as any);
  const buffers: Buffer[] = [];

  doc.registerFont("Regular", regularFont);
  doc.registerFont("Bold", boldFont);

  doc.on("data", (chunk) => buffers.push(chunk));

  const pdfPromise = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);
  });

  // Page setup with background
  doc.on("pageAdded", () => {
    // Subtle background pattern (diagonal lines)
    doc.save();
    doc.strokeColor("#fed7aa").lineWidth(0.5);
    for (let i = 0; i < doc.page.width; i += 20) {
      doc.moveTo(i, 0).lineTo(i + 20, doc.page.height);
    }
    doc.stroke();
    doc.restore();
  });

  // Add logo
  const logoPath = path.join(process.cwd(), "public/croa.png");
  try {
    doc.image(logoPath, 50, 50, { width: 100 });
  } catch (e) {
    console.error("Logo not found:", e);
  }

  // Custom header with total stocks count
  doc.font("Bold").fontSize(24).fillColor("#ea580c").text("Relatório de Stocks", 200, 60, { align: "center" });
  doc.fontSize(12).fillColor("#000").text(`Total de Stocks: ${stocks.length}`, 200, 85, { align: "center" });

  // Add generation date
  doc.moveDown(1);
  doc.fontSize(10).fillColor("#ea580c").text(`Gerado em: ${new Date().toLocaleString("pt-PT")}`, { align: "center" });
  doc.moveDown();

  // Fetch usernames for better display
  let userMap: Record<number, string> = {};
  try {
    // @ts-ignore generated on prisma generate
    const allUsers = await prisma.user.findMany();
    userMap = Object.fromEntries(allUsers.map((u: any) => [u.id, u.username]));
  } catch (e) {
    console.error("Error fetching users for PDF:", e);
  }

  // Prepare table data
  const headers = ["ID", "Nome", "Quantidade", "Última Edição", "Utilizador"];
  const tableData = stocks.map((s) => [
    String(s.id),
    s.nome,
    String(s.quantidade),
    s.datas ? new Date(s.datas as any).toLocaleDateString("pt-PT") : "-",
    userMap[s.utilizador] || `ID ${s.utilizador}`,
  ]);

  // Enhanced table drawing function with orange/white theme
  const drawTable = (doc: any, headers: string[], rows: string[][]) => {
    const pageWidth = doc.page.width - 100; // margins
    const colWidth = pageWidth / headers.length;
    let y = doc.y;

    // Header background with gradient approximation (solid orange)
    doc.rect(50, y - 5, pageWidth, 25).fill("#ea580c");

    // Headers
    doc.fillColor("#fff").font("Bold").fontSize(12);
    headers.forEach((header, i) => {
      doc.text(header, 50 + i * colWidth, y, {
        width: colWidth,
        align: "center",
      });
    });

    y += 20;
    doc.moveTo(50, y).lineTo(50 + pageWidth, y).stroke("#fff");

    // Rows
    doc.font("Regular").fontSize(10);
    rows.forEach((row, rowIndex) => {
      y += 25;

      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }

      // Alternating row background (white and light orange)
      if (rowIndex % 2 === 0) {
        doc.rect(50, y - 5, pageWidth, 20).fill("#fff");
      } else {
        doc.rect(50, y - 5, pageWidth, 20).fill("#fed7aa");
      }

      row.forEach((cell, i) => {
        doc.fillColor("#000").text(cell, 50 + i * colWidth, y, {
          width: colWidth,
          align: "center",
          lineBreak: true,
        });
      });

      // Row border
      doc.moveTo(50, y + 15).lineTo(50 + pageWidth, y + 15).stroke("#ea580c");
    });

    // Table border
    doc.rect(50, doc.y - rows.length * 25 - 25, pageWidth, rows.length * 25 + 25).stroke("#ea580c");
  };

  drawTable(doc, headers, tableData);

  // Add footer with page numbers
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor("#ea580c").text(`Página ${i + 1} de ${totalPages}`, 50, doc.page.height - 50, { align: "center" });
  }

  // Subtle watermark
  doc.save();
  doc.opacity(0.1);
  doc.fontSize(50).fillColor("#ea580c").text("CMO Animais", 100, doc.page.height / 2, { align: "center" });
  doc.restore();

  doc.end();

  const pdfBuffer = await pdfPromise;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="stocks.pdf"',
    },
  });
}


    // attach last 10 history entries per stock without using relations
    const stockIds = stocks.map((s) => s.id);

    let historyByStock: Record<
      number,
      { id: number; stockId: number; nome: string; quantidade: number; datas: Date; utilizador: number }[]
    > = {};

    if (stockIds.length > 0) {
      // @ts-ignore generated on prisma generate
      const allHistory = await prisma.stockHistory.findMany({
        where: { stockId: { in: stockIds } },
        orderBy: { datas: "desc" },
      });

      historyByStock = allHistory.reduce((acc: typeof historyByStock, h: any) => {
        if (!acc[h.stockId]) acc[h.stockId] = [];
        if (acc[h.stockId].length < 10) {
          acc[h.stockId].push(h);
        }
        return acc;
      }, {});
    }

    const result = stocks.map((s) => ({
      ...s,
      StockHistory: historyByStock[s.id] ?? [],
    }));

    return NextResponse.json(result);
} catch (error) {
  console.error("PDF ERROR:", error);
  return NextResponse.json(
    { error: String(error) },
    { status: 500 }
  );
}
}

// CREATE a new stock entry
export async function POST(request: Request) {
  try {
    const { nome, quantidade, utilizador } = await request.json();

    if (
      !nome ||
      nome.trim() === "" ||
      quantidade === undefined ||
      quantidade === null ||
      isNaN(Number(quantidade)) ||
      utilizador === undefined ||
      utilizador === null ||
      isNaN(Number(utilizador))
    ) {
      return NextResponse.json(
        { error: "Nome, quantidade e utilizador são obrigatórios" },
        { status: 400 }
      );
    }

    const newStock = await prisma.stocks.create({
      data: {
        nome: nome.trim(),
        quantidade: Number(quantidade),
        datas: new Date(), // data da criação/edição automática
        utilizador: Number(utilizador),
      },
    });

    // create history entry
    // @ts-ignore generated on prisma generate
    await prisma.stockHistory.create({
      data: {
        stockId: newStock.id,
        nome: newStock.nome,
        quantidade: newStock.quantidade,
        datas: new Date(),
        utilizador: Number(utilizador),
      },
    });
    await trimHistory(newStock.id);

    return NextResponse.json(newStock, { status: 201 });
  } catch (error) {
    console.error("Error creating stock:", error);
    return NextResponse.json(
      { error: "Failed to create stock" },
      { status: 500 }
    );
  }
}

// UPDATE an existing stock entry
export async function PUT(request: Request) {
  try {
    const { id, nome, quantidade, utilizador } = await request.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "ID em falta ou inválido" },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (nome !== undefined) {
      if (!nome || nome.trim() === "") {
        return NextResponse.json(
          { error: "Nome não pode ser vazio" },
          { status: 400 }
        );
      }
      updateData.nome = nome.trim();
    }

    if (quantidade !== undefined) {
      if (quantidade === null || isNaN(Number(quantidade))) {
        return NextResponse.json(
          { error: "Quantidade inválida" },
          { status: 400 }
        );
      }
      updateData.quantidade = Number(quantidade);
    }

    if (utilizador === undefined || utilizador === null || isNaN(Number(utilizador))) {
      return NextResponse.json(
        { error: "Utilizador inválido" },
        { status: 400 }
      );
    }

    // Sempre atualiza data e utilizador na edição
    updateData.datas = new Date();
    updateData.utilizador = Number(utilizador);

    const updatedStock = await prisma.stocks.update({
      where: { id: Number(id) },
      data: updateData,
    });

    // create history entry
    // @ts-ignore generated on prisma generate
    await prisma.stockHistory.create({
      data: {
        stockId: updatedStock.id,
        nome: updatedStock.nome,
        quantidade: updatedStock.quantidade,
        datas: new Date(),
        utilizador: Number(utilizador),
      },
    });
    await trimHistory(updatedStock.id);

    return NextResponse.json(updatedStock);
  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json(
      { error: "Failed to update stock" },
      { status: 500 }
    );
  }
}

// DELETE a stock entry
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "ID em falta ou inválido" },
        { status: 400 }
      );
    }

    await prisma.stocks.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting stock:", error);
    return NextResponse.json(
      { error: "Failed to delete stock" },
      { status: 500 }
    );
  }
}
