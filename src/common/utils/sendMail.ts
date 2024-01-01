import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const transport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
}

export async function sendMail(to: string, subject: string, text: string): Promise<nodemailer.SendMessageInfo> {
  const message: MailOptions = {
    from: "쓰담쓰담",
    to,
    subject,
    text,
  };
  const info: nodemailer.SendMessageInfo = await transport.sendMail(message);
  return info;
}
