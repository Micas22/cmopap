import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return new Response(JSON.stringify({ error: "Utilizador não encontrado" }), { status: 404 });
  }

  if (user.password !== password) {
    return new Response(JSON.stringify({ error: "Palavra-passe incorreta" }), { status: 401 });
  }

  return new Response(JSON.stringify({ success: true, email: user.email, perms: user.perms }));
}