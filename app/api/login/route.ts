import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  if (user.password !== password) {
    return new Response(JSON.stringify({ error: "Incorrect password" }), { status: 401 });
  }

  // Return username so frontend can save it
  return new Response(JSON.stringify({ success: true, username: user.username, perms: user.perms }));
}