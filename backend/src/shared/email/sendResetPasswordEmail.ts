import { transporter } from "./mailer";

export async function sendResetPasswordEmail(
  email: string,
  token: string
) {
  const resetUrl =
        `${process.env.APP_URL}/reset-password?token=${token}`;
    console.log(resetUrl);

  await transporter.sendMail({
    from: `"HydroNova" <${process.env.SMTP_USER}>`,
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
}