import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        password: true, // ⚠️ Only send this if necessary
        perms: true,
        vaccine_notifications: true,
        report_notifications: true,
      },
    });

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch users" }), { status: 500 });
  }
}

// CREATE a new user
export async function POST(req: Request) {
  try {
    const { username, password, perms, vaccine_notifications, report_notifications } = await req.json();

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "Username already exists" }), { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: { username, password, perms: perms ?? 0, vaccine_notifications: vaccine_notifications ?? true, report_notifications: report_notifications ?? true },
      select: { id: true, username: true, password: true, perms: true, vaccine_notifications: true, report_notifications: true },
    });

    return new Response(JSON.stringify(newUser), { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return new Response(JSON.stringify({ error: "Failed to create user" }), { status: 500 });
  }
}

// EDIT / UPDATE a user
export async function PUT(req: Request) {
  try {
    const { id, username, password, perms, vaccine_notifications, report_notifications } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { username, password, perms, vaccine_notifications, report_notifications },
      select: { id: true, username: true, password: true, perms: true, vaccine_notifications: true, report_notifications: true },
    });

    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return new Response(JSON.stringify({ error: "Failed to update user" }), { status: 500 });
  }
}

// DELETE a user
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    await prisma.user.delete({ where: { id } });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response(JSON.stringify({ error: "Failed to delete user" }), { status: 500 });
  }
}
