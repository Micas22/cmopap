import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || "default_super_secret_key_change_me_in_production";
  return new TextEncoder().encode(secret);
};

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
  }

  if (user.password !== password) {
    return NextResponse.json({ error: "Palavra-passe incorreta" }, { status: 401 });
  }

  const token = await new SignJWT({ 
    id: user.id, 
    email: user.email, 
    perms: user.perms 
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJwtSecretKey());

  const response = NextResponse.json({ success: true, id: user.id, email: user.email, perms: user.perms });
  
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return response;
}