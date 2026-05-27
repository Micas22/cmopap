import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email ou palavra-passe em falta" }), { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return new Response(JSON.stringify({ error: "Email já registado" }), { status: 409 });
  }

  const user = await prisma.user.create({
    data: { email, password, perms: 0 },
  });

  return new Response(JSON.stringify({ success: true, id: user.id, email: user.email, perms: user.perms }));
}
