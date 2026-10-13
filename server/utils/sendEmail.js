import nodemailer from "nodemailer";

export default async function sendEmail({ to, subject, html, text }) {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();

  if (!user || !pass) {
    throw new Error("EMAIL_USER or EMAIL_PASS is not configured on the backend");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"Task Manager" <${user}>`,
    to,
    subject,
    text,
    html,
  });
}
