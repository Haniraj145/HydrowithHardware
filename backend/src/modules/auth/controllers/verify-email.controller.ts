import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";

export async function verifyEmail(req: Request, res: Response) {
  try {
    const token = req.query.token as string;

    if (!token) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?verified=false`
      );
    }

    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!record) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?verified=false`
      );
    }

    if (record.expiresAt < new Date()) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?verified=expired`
      );
    }

    await prisma.user.update({
      where: {
        id: record.userId,
      },
      data: {
        isVerified: true,
      },
    });

    await prisma.emailVerificationToken.delete({
      where: {
        token,
      },
    });

    return res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?verified=true`
    );

  } catch (err) {
    console.error(err);

    return res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?verified=false`
    );
  }
}