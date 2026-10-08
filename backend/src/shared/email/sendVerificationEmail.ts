import { transporter } from "./mailer";
import { logger } from "../logger";

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<{ sent: boolean; url: string }> {
  const verificationUrl =
    `${process.env.BACKEND_URL || "http://localhost:5000"}/api/v1/auth/verify-email?token=${token}`;

  logger.info(`==================================================`);
  logger.info(`📧 EMAIL VERIFICATION LINK FOR [${email}]:`);
  logger.info(`👉 ${verificationUrl}`);
  logger.info(`==================================================`);

  try {
    await transporter.sendMail({
      from: `"HydroNova" <${process.env.SMTP_USER || "hydronovasupport@gmail.com"}>`,
      to: email,
      subject: "Verify your HydroNova account",
      html: `
        <h2>Welcome to HydroNova 🌱</h2>

        <p>Click the button below to verify your email.</p>

        <a href="${verificationUrl}"
           style="
             background:#16a34a;
             color:white;
             padding:12px 24px;
             text-decoration:none;
             border-radius:8px;
             display:inline-block;
           ">
           Verify Email
        </a>

        <p>This link expires in 24 hours.</p>
      `,
    });
    return { sent: true, url: verificationUrl };
  } catch (error: any) {
    logger.error("Failed to send verification email via SMTP:", error?.message || error);
    return { sent: false, url: verificationUrl };
  }
}