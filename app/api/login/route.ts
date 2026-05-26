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

  // --- Login Tracking ---
  try {
    let ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "Desconhecido";
    if (ipAddress === "::1" || ipAddress === "127.0.0.1") ipAddress = "Localhost";
    
    const userAgent = req.headers.get("user-agent") || "Desconhecido";
    let location = "Desconhecido";

    if (ipAddress !== "Localhost" && ipAddress !== "Desconhecido") {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ipAddress}?fields=city,country`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.city && geoData.country) {
            location = `${geoData.city}, ${geoData.country}`;
          }
        }
      } catch (e) {
        console.error("Geo fetch failed:", e);
      }
    }

    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress,
        userAgent,
        location,
      }
    });
  } catch (error) {
    console.error("Failed to save login history:", error);
  }
  // -----------------------

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