import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return Response.json({ error: "Dados em falta" }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: "A palavra-passe deve ter pelo menos 6 caracteres" }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.used) {
      return Response.json({ error: "Link inválido ou já utilizado" }, { status: 400 });
    }

    // Update password
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("reset-password error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
