"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  authenticateAdmin,
  createSession,
  deleteSession,
  getSession,
  hashPassword,
} from "@/lib/auth";
import { adminSetupSchema } from "@/lib/validations";

export type LoginResult =
  | { success: true }
  | { success: false; error: string };

export async function loginAction(
  email: string,
  password: string
): Promise<LoginResult> {
  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  try {
    const user = await authenticateAdmin(email, password);
    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    await createSession(user);
    return { success: true };
  } catch {
    return { success: false, error: "Login failed. Please try again." };
  }
}

export async function logoutAction() {
  await deleteSession();
  revalidatePath("/admin");
}

export async function setupAdminAction(
  email: string,
  password: string,
  name: string
): Promise<LoginResult> {
  const validation = adminSetupSchema.safeParse({ email, password, name });
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return { success: false, error: firstError?.message || "Invalid input" };
  }

  try {
    const session = await getSession();
    if (session) {
      return { success: false, error: "Already authenticated" };
    }

    const existingAdmin = await prisma.user.findFirst({
      where: { role: "admin" },
    });

    if (existingAdmin) {
      return { success: false, error: "Admin account already exists" };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "Email already in use" };
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "admin",
      },
    });

    await createSession(user);
    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[setupAdminAction] Setup failed:", error);
    }

    return {
      success: false,
      error: "Setup failed. Please try again.",
    };
  }
}

export async function getAdminUser() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true },
  });

  return user;
}
