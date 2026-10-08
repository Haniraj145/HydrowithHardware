import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  connectionTimeout: 5000, // 5 seconds connection timeout
  socketTimeout: 5000,     // 5 seconds socket timeout
  greetingTimeout: 5000,   // 5 seconds greeting timeout
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

console.log("Mailer Host:", process.env.SMTP_HOST || "smtp.gmail.com");