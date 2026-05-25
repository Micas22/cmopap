import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return Response.json({ error: "Email obrigatório" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success – don't leak whether the email exists
    if (!user) {
      return Response.json({ success: true });
    }

    // Invalidate any previous unused tokens for this email
    await prisma.passwordResetToken.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.passwordResetToken.create({
      data: { email, token },
    });

    const resetUrl = `${APP_URL}/reset-password?token=${token}`;

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "CROACONNECT", email: "croaconnect@gmail.com" },
        to: [{ email }],
        subject: "Recuperação de palavra-passe – CROA Olhão",
        htmlContent: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #e5e7eb">
            <div style="background:linear-gradient(135deg,#f97316,#f59e0b);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
              <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">CROA Olhão</h1>
              <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px">Recuperação de palavra-passe</p>
            </div>

            <p style="color:#374151;font-size:15px;line-height:1.6">Olá,</p>
            <p style="color:#374151;font-size:15px;line-height:1.6">
              Recebemos um pedido para redefinir a palavra-passe associada a esta conta.<br/>
              Clique no botão abaixo para definir uma nova palavra-passe.
            </p>

            <div style="text-align:center;margin:32px 0">
              <a href="${resetUrl}"
                style="display:inline-block;background:linear-gradient(135deg,#f97316,#f59e0b);color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none">
                Redefinir palavra-passe
              </a>
            </div>

            <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 18px;margin-bottom:20px">
              <p style="margin:0 0 4px;color:#9a3412;font-size:13px;font-weight:700">⚠️ Aviso de segurança</p>
              <p style="margin:0;color:#c2410c;font-size:13px;line-height:1.5">
                Se não solicitou esta alteração, pode ignorar este email — a sua conta está segura e nenhuma alteração foi efetuada.
              </p>
            </div>

            <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0"/>
            <p style="color:#d1d5db;font-size:12px;text-align:center">Powered by MCR – José Rijo</p>
          </div>
        `,
      }),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("forgot-password error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
