import { transporter } from "./mailer";

export async function sendVerificationEmail(
  email: string,
  token: string
) {
  const verificationUrl =
    `${process.env.BACKEND_URL || "http://localhost:5001"}/api/v1/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"HydroNova" <${process.env.SMTP_USER}>`,
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
}