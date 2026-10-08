import { transporter } from "./mailer";
import { logger } from "../logger";

export async function sendResetPasswordEmail(
  email: string,
  token: string
): Promise<{ sent: boolean; url: string }> {
  const resetUrl = `${process.env.CLIENT_URL || process.env.APP_URL || "http://localhost:8080"}/reset-password?token=${token}`;

  logger.info(`==================================================`);
  logger.info(`🔒 PASSWORD RESET LINK FOR [${email}]:`);
  logger.info(`👉 ${resetUrl}`);
  logger.info(`==================================================`);

  try {
    await transporter.sendMail({
      from: `"HydroNova" <${process.env.SMTP_USER || "hydronovasupport@gmail.com"}>`,
      to: email,
      subject: "Reset your HydroNova password",
      html: `
        <div style="font-family:Arial,sans-serif;padding:30px">
          <h2>Reset Password 🔒</h2>

          <p>
            We received a request to reset your HydroNova password.
          </p>

          <a
            href="${resetUrl}"
            style="
              display:inline-block;
              padding:12px 24px;
              background:#16a34a;
              color:white;
              text-decoration:none;
              border-radius:8px;
            "
          >
            Reset Password
          </a>

          <p style="margin-top:20px">
            This link will expire in 1 hour.
          </p>

          <p>
            If you didn't request this, simply ignore this email.
          </p>
        </div>
      `,
    });
    return { sent: true, url: resetUrl };
  } catch (error: any) {
    logger.error("Failed to send reset password email via SMTP:", error?.message || error);
    return { sent: false, url: resetUrl };
  }
}