import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { getResetClientUrl } from "../utils/resetClientUrl.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const userData = (u) => ({ id: u._id, name: u.name, email: u.email });

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password });
    res.status(201).json({ token: signToken(user._id), user: userData(user) });
  } catch (err) {
    res.status(500).json({ message: "Unable to register account" });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    const user = email ? await User.findOne({ email }).select("+password") : null;
    if (!user || typeof password !== "string" || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ token: signToken(user._id), user: userData(user) });
  } catch (err) {
    res.status(500).json({ message: "Unable to log in" });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const genericMessage = "If an account exists for that email, a reset link has been sent.";

  try {
    const email = typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

    if (!email) {
      return res.status(400).json({ message: "Please enter your email address" });
    }

    const user = await User.findOne({ email });

    // Always return the same success message for existing and non-existing emails.
    if (!user) return res.json({ message: genericMessage });

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const clientUrl = getResetClientUrl();
    if (!clientUrl) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      console.error("Forgot password email not sent: configure a valid PASSWORD_RESET_URL or CLIENT_URL");
      return res.status(500).json({ message: "Password reset is temporarily unavailable. Please try again later." });
    }

    const resetUrl = `${clientUrl}/reset-password/${rawToken}`;
    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your Task Manager password",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1e293b;max-width:560px;margin:auto">
            <h2>Reset your password</h2>
            <p>We received a request to reset the password for your Task Manager account.</p>
            <p><a href="${resetUrl}" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Reset password</a></p>
            <p>This link expires in 15 minutes and can only be used once.</p>
            <p>If you did not request this, you can ignore this email.</p>
          </div>`,
        text: `Reset your Task Manager password: ${resetUrl}\nThis link expires in 15 minutes and can only be used once. If you did not request this, ignore this email.`,
      });
    } catch (emailError) {
      // Do not leave a usable token behind if delivery failed.
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      console.error("Forgot password email delivery failed:", emailError.message);
      return res.status(500).json({ message: "Unable to send the reset email right now. Please try again later." });
    }

    // Never log the raw reset token or reset URL.
    return res.json({ message: genericMessage });
  } catch (err) {
    console.error("Forgot password request failed:", err.message);
    return res.status(500).json({ message: "Unable to process your request right now. Please try again later." });
  }
};

// POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const rawToken = req.params.token;
    if (!rawToken || !/^[a-f0-9]{64}$/i.test(rawToken)) {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }

    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired. Please request a new one." });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: "Password updated successfully. You can now log in with your new password." });
  } catch (err) {
    console.error("Reset password failed:", err.message);
    return res.status(500).json({ message: "Unable to reset your password right now. Please try again later." });
  }
};

// GET /api/auth/me
export const getMe = (req, res) => res.json(userData(req.user));