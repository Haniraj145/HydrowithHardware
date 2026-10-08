import { authRepository } from "./auth.repository";
import {
  hashPassword,
  comparePassword,
} from "../../shared/security/hash";
import { AppError } from "../../shared/errors/AppError";
import { v4 as uuid } from "uuid";
import { sendResetPasswordEmail } from "../../shared/email/sendResetPasswordEmail";
import { sendVerificationEmail } from "../../shared/email/sendVerificationEmail";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../shared/security/jwt";

class AuthService {
  async register(data: {
    fullName: string;
    email: string;
    password: string;
  }) {
    const existingUser = await authRepository.findByEmail(data.email);

    let user;
    if (existingUser) {
      if (existingUser.isVerified) {
        throw new AppError("Email already exists", 409);
      }

      // Account exists but is unverified: update user info & replace verification token
      const passwordHash = await hashPassword(data.password);
      user = await authRepository.updateUser(existingUser.id, {
        fullName: data.fullName,
        passwordHash,
      });

      await authRepository.deleteEmailVerificationTokensByUserId(user.id);
    } else {
      const passwordHash = await hashPassword(data.password);

      user = await authRepository.createUser({
        fullName: data.fullName,
        email: data.email,
        passwordHash,
      });
    }

    const verificationToken = uuid();

    await authRepository.createEmailVerificationToken({
      token: verificationToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await sendVerificationEmail(user.email, verificationToken);

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      isVerified: user.isVerified,
      message:
        "Registration successful. Please check your email to verify your account.",
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await authRepository.findByEmail(data.email);

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await comparePassword(
      data.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.isVerified) {
      throw new AppError("Please verify your email first.", 401);
    }

    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    await authRepository.createRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async verifyEmail(token: string) {
    const record = await authRepository.findEmailVerificationToken(token);

    if (!record) {
      throw new AppError("Invalid verification token", 400);
    }

    if (record.expiresAt < new Date()) {
      throw new AppError("Verification token expired", 400);
    }

    await authRepository.verifyUser(record.userId);
    await authRepository.deleteEmailVerificationToken(token);

    return { message: "Email verified successfully" };
  }

  async resendVerification(email: string) {
    const user = await authRepository.findByEmail(email);

    // Silent no-op for unknown emails (avoid user enumeration)
    if (!user) {
      return {
        message:
          "If an unverified account with that email exists, a new verification link has been sent.",
      };
    }

    if (user.isVerified) {
      return { message: "This email is already verified. You can log in." };
    }

    // Delete existing tokens before creating a fresh one
    await authRepository.deleteEmailVerificationTokensByUserId(user.id);

    const verificationToken = uuid();

    await authRepository.createEmailVerificationToken({
      token: verificationToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await sendVerificationEmail(user.email, verificationToken);

    return {
      message:
        "If an unverified account with that email exists, a new verification link has been sent.",
    };
  }

  async refresh(refreshToken: string) {
    const storedToken = await authRepository.findRefreshToken(refreshToken);

    if (!storedToken) {
      throw new AppError("Invalid refresh token", 401);
    }

    if (storedToken.expiresAt < new Date()) {
      throw new AppError("Refresh token expired", 401);
    }

    const payload = verifyRefreshToken(refreshToken) as { userId: string };

    const accessToken = generateAccessToken({ userId: payload.userId });

    return { accessToken };
  }

  async logout(refreshToken: string) {
    const storedToken = await authRepository.findRefreshToken(refreshToken);

    if (!storedToken) {
      throw new AppError("Invalid refresh token", 401);
    }

    await authRepository.deleteRefreshToken(refreshToken);

    return { message: "Logged out successfully" };
  }

  async forgotPassword(email: string) {
    const user = await authRepository.findByEmail(email);

    if (!user) {
      return {
        message:
          "If an account with that email exists, a password reset link has been sent.",
      };
    }

    const token = uuid();

    await authRepository.createPasswordResetToken({
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    await sendResetPasswordEmail(user.email, token);

    return {
      message:
        "If an account with that email exists, a password reset link has been sent.",
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await authRepository.findPasswordResetToken(token);

    if (!record) {
      throw new AppError("Invalid reset token", 400);
    }

    if (record.expiresAt < new Date()) {
      throw new AppError("Reset token expired", 400);
    }

    const passwordHash = await hashPassword(newPassword);

    await authRepository.updatePassword(record.userId, passwordHash);
    await authRepository.deletePasswordResetToken(token);

    return { message: "Password reset successful" };
  }
}

export const authService = new AuthService();
