import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";

export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Find animals with vaccines scheduled for today
    const animals = await prisma.animal.findMany({
      where: {
        data_proxima_vacina: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    if (animals.length === 0) {
      return NextResponse.json({ success: true, message: "No vaccines due today." });
    }

    // Find admins who want vaccine notifications
    const admins = await prisma.user.findMany({
      where: { perms: 1, vaccine_notifications: true },
    });

    if (admins.length === 0) {
      return NextResponse.json({ success: true, message: "No admins to notify." });
    }

    let notificationsCreated = 0;

    for (const animal of animals) {
      const title = `Vacina Hoje: ${animal.nome}`;
      const description = `O animal ${animal.nome} (Chip: ${animal.chip || 'N/D'}) tem uma vacina agendada para hoje.`;

      // Check if this specific notification was already created today to avoid duplicates
      const existingNotification = await prisma.notification.findFirst({
        where: {
          title,
          dataAndTime: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      });

      if (!existingNotification) {
        // Create DB notifications for all admins for this animal
        const notificationData = admins.map((admin: any) => ({
          userId: admin.id,
          type: "info",
          title,
          description,
          dataAndTime: new Date(),
          read: false,
        }));

        await prisma.notification.createMany({
          data: notificationData,
        });

        notificationsCreated++;

        // Send emails
        const adminEmails = admins.map((admin: any) => admin.email).filter(Boolean);
        await sendNotificationEmail(
          adminEmails,
          "Aviso de Vacina – CROA Olhão",
          "Vacina Agendada para Hoje",
          `<p>O seguinte animal tem uma vacina agendada para hoje:</p>
           <p><strong>Nome:</strong> ${animal.nome}<br/>
           <strong>Chip:</strong> ${animal.chip || 'N/D'}</p>
           <p>Por favor, verifique o sistema para mais detalhes.</p>`
        );
      }
    }

    return NextResponse.json({ success: true, notificationsCreated });
  } catch (error) {
    console.error("Error checking vaccines:", error);
    return NextResponse.json(
      { error: "Failed to check vaccines" },
      { status: 500 }
    );
  }
}
