import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return new Response(JSON.stringify({ error: "Missing username or password" }), { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { username },
  });

  if (existing) {
    return new Response(JSON.stringify({ error: "Username already exists" }), { status: 409 });
  }

  const user = await prisma.user.create({
    data: { username, password },
  });

  return new Response(JSON.stringify({ success: true, user }));
}
