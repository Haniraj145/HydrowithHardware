import { transporter } from "./shared/email/mailer";

async function main() {
  await transporter.verify();
  console.log("✅ SMTP Connected!");
}

main().catch(console.error);