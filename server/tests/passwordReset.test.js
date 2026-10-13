import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import { forgotPassword, resetPassword } from "../controllers/authController.js";
import { getResetClientUrl } from "../utils/resetClientUrl.js";

function response() {
  return { statusCode: 200, status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; } };
}

test("email links use one valid frontend origin", () => {
  assert.equal(getResetClientUrl({ CLIENT_URL: '"https://app.example/",https://preview.example' }), "https://app.example");
  assert.equal(getResetClientUrl({ CLIENT_URL: "https://preview.example", PASSWORD_RESET_URL: "https://app.example/" }), "https://app.example");
  for (const url of ["", "invalid", "javascript:alert(1)", "https://user:pass@app.example"]) {
    assert.equal(getResetClientUrl({ CLIENT_URL: url }), null);
  }
});

test("forgot and reset flow hashes tokens, expires links, consumes tokens, and hashes the new password", async (t) => {
  const env = { ...process.env };
  t.after(() => { process.env = env; });
  delete process.env.BREVO_API_KEY;
  process.env.CLIENT_URL = "https://app.example,https://preview.example";
  delete process.env.PASSWORD_RESET_URL;
  process.env.EMAIL_USER = "sender@example.com";
  process.env.EMAIL_PASS = "test-only";
  const user = new User({ name: "Test", email: "test@example.com", password: "old-password" });
  t.mock.method(user, "save", async function () {
    // Execute the real schema middleware without a database connection.
    await User.schema.s.hooks.execPre("save", this, []);
    return this;
  });
  let query;
  t.mock.method(User, "findOne", async (filter) => {
    query = filter;
    if (filter.email) return user;
    return user.resetPasswordToken === filter.resetPasswordToken &&
      user.resetPasswordExpires > filter.resetPasswordExpires.$gt ? user : null;
  });
  let email;
  t.mock.method(nodemailer, "createTransport", () => ({ sendMail: async (message) => { email = message; } }));
  const sent = response();
  await forgotPassword({ body: { email: " TEST@example.com " } }, sent);
  assert.equal(sent.statusCode, 200);
  assert.equal(query.email, "test@example.com");
  const rawToken = email.text.match(/reset-password\/([a-f0-9]{64})/)[1];
  assert.ok(email.text.includes("https://app.example/reset-password/"));
  assert.equal(user.resetPasswordToken, crypto.createHash("sha256").update(rawToken).digest("hex"));
  assert.ok(user.resetPasswordExpires > new Date());
  assert.ok(user.resetPasswordExpires <= new Date(Date.now() + 15 * 60 * 1000));

  const reset = response();
  await resetPassword({ params: { token: rawToken }, body: { password: "new-password" } }, reset);
  assert.equal(reset.statusCode, 200);
  assert.equal(user.resetPasswordToken, undefined);
  assert.equal(user.resetPasswordExpires, undefined);
  assert.notEqual(user.password, "new-password");
  assert.equal(await user.matchPassword("new-password"), true);
  const reused = response();
  await resetPassword({ params: { token: rawToken }, body: { password: "another-password" } }, reused);
  assert.equal(reused.statusCode, 400);
});

test("expired or malformed reset links and short passwords are rejected", async (t) => {
  t.mock.method(User, "findOne", async () => null);
  for (const [token, password] of [["a".repeat(64), "new-password"], ["bad-token", "new-password"], ["a".repeat(64), "short"]]) {
    const res = response();
    await resetPassword({ params: { token }, body: { password } }, res);
    assert.equal(res.statusCode, 400);
  }
});

test("email delivery failure clears the pending reset token", async (t) => {
  const env = { ...process.env };
  t.after(() => { process.env = env; });
  delete process.env.BREVO_API_KEY;
  process.env.CLIENT_URL = "https://app.example";
  delete process.env.PASSWORD_RESET_URL;
  process.env.EMAIL_USER = "sender@example.com";
  process.env.EMAIL_PASS = "test-only";
  const user = { email: "test@example.com", save: async () => {} };
  t.mock.method(User, "findOne", async () => user);
  t.mock.method(nodemailer, "createTransport", () => ({ sendMail: async () => { throw new Error("Simulated delivery failure"); } }));
  t.mock.method(console, "error", () => {});
  const res = response();
  await forgotPassword({ body: { email: user.email } }, res);
  assert.equal(res.statusCode, 500);
  assert.equal(user.resetPasswordToken, undefined);
  assert.equal(user.resetPasswordExpires, undefined);
});