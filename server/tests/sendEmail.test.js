import test from "node:test";
import assert from "node:assert/strict";
import nodemailer from "nodemailer";
import sendEmail from "../utils/sendEmail.js";

const message = { to: "recipient@example.com", subject: "Reset password", html: "<p>Test</p>", text: "Test" };
function configure(t) {
  const env = { ...process.env };
  t.after(() => { process.env = env; });
  process.env.BREVO_API_KEY = "test-key";
  process.env.BREVO_SENDER_EMAIL = "sender@example.com";
  delete process.env.BREVO_SENDER_NAME;
}

test("Brevo sends the documented HTTPS payload without using SMTP", async (t) => {
  configure(t);
  t.mock.method(nodemailer, "createTransport", () => { throw new Error("SMTP must not run"); });
  const mock = t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://api.brevo.com/v3/smtp/email");
    assert.equal(options.method, "POST");
    assert.equal(options.headers["api-key"], "test-key");
    assert.ok(options.signal instanceof AbortSignal);
    assert.deepEqual(JSON.parse(options.body), {
      sender: { email: "sender@example.com", name: "Task Manager" },
      to: [{ email: message.to }], subject: message.subject,
      htmlContent: message.html, textContent: message.text,
    });
    return { ok: true, status: 201 };
  });
  await sendEmail(message);
  assert.equal(mock.mock.callCount(), 1);
});

test("Brevo failures reject without falling back to SMTP or exposing provider content", async (t) => {
  configure(t);
  t.mock.method(nodemailer, "createTransport", () => { throw new Error("SMTP must not run"); });
  t.mock.method(globalThis, "fetch", async () => ({ ok: false, status: 401 }));
  await assert.rejects(sendEmail(message), /^Error: Brevo email delivery failed \(HTTP 401\)$/);
});

test("missing verified sender stops delivery before calling Brevo", async (t) => {
  configure(t);
  delete process.env.BREVO_SENDER_EMAIL;
  const mock = t.mock.method(globalThis, "fetch", async () => { throw new Error("Must not send"); });
  await assert.rejects(sendEmail(message), /BREVO_SENDER_EMAIL/);
  assert.equal(mock.mock.callCount(), 0);
});

test("network failures propagate to reset-token cleanup", async (t) => {
  configure(t);
  t.mock.method(globalThis, "fetch", async () => { throw new Error("Connection timed out"); });
  await assert.rejects(sendEmail(message), /Connection timed out/);
});