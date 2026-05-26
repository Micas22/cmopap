export const sendNotificationEmail = async (
  toEmails: string[],
  subject: string,
  title: string,
  content: string
) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY!;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!BREVO_API_KEY || toEmails.length === 0) return;

  const htmlContent = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #e5e7eb">
      <div style="background:linear-gradient(135deg,#f97316,#f59e0b);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">CROA Olhão</h1>
        <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px">${title}</p>
      </div>

      <p style="color:#374151;font-size:15px;line-height:1.6">Olá,</p>
      <div style="color:#374151;font-size:15px;line-height:1.6;margin-bottom:24px;">
        ${content}
      </div>

      <div style="text-align:center;margin:32px 0">
        <a href="${APP_URL}/dashboard"
          style="display:inline-block;background:linear-gradient(135deg,#f97316,#f59e0b);color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none">
          Aceder ao Dashboard
        </a>
      </div>

      <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0"/>
      <p style="color:#d1d5db;font-size:12px;text-align:center">Powered by MCR – José Rijo</p>
    </div>
  `;

  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "CROACONNECT", email: "croaconnect@gmail.com" },
        to: toEmails.map(email => ({ email })),
        subject: subject,
        htmlContent,
      }),
    });
  } catch (error) {
    console.error("Error sending notification email:", error);
  }
};
