import nodemailer from "nodemailer";

export default async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (apiKey) {
    const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
    if (!senderEmail) throw new Error("BREVO_SENDER_EMAIL is not configured on the backend");
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sender: { email: senderEmail, name: process.env.BREVO_SENDER_NAME?.trim() || "Task Manager" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      // Provider responses can include sensitive content; log only the status.
      throw new Error(`Brevo email delivery failed (HTTP ${response.status})`);
    }
    return;
  }

  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();

  if (!user || !pass) {
    throw new Error("EMAIL_USER or EMAIL_PASS is not configured on the backend");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });

  await transporter.sendMail({
    from: `"Task Manager" <${user}>`,
    to,
    subject,
    text,
    html,
  });
}
