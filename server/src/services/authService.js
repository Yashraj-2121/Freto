import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { randomInt } from "crypto";
import { nanoid } from "nanoid";
import { User, RefreshToken, OrganizationMember } from "../models/postgres/index.js";
import { sendNotification } from "./notificationsService.js";
import { redis } from "../config/redis.js";
import { AppError } from "../middleware/error.js";

const OTP_TTL_SECONDS = 5 * 60;
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_DAYS = 30;

export const otpKey = (phone) => `otp:${phone}`;

export async function requestOtp(phone) {
  try {
    const code = String(randomInt(100000, 999999));
    console.log(`[OTP] Generating OTP for ${phone}: ${code}`);
    
    // Redis-backed with a TTL — survives across multiple API instances (an
    // in-memory Map would only work as long as one process handled both the
    // request and the verify call).
    await redis.set(otpKey(phone), code, "EX", OTP_TTL_SECONDS);
    console.log(`[OTP] Stored in Redis successfully`);

    // The OTP code itself is never written to the notification log's
    // "payload" in production — logged here only under NODE_ENV=development.
    await sendNotification({
      userId: phone, // no User row may exist yet for first-time signups
      channel: "SMS",
      template: "otp_code",
      recipient: phone,
      payload: process.env.NODE_ENV !== "production" ? { code } : undefined,
    });
    console.log(`[OTP] Notification sent successfully`);

    return { message: "OTP sent", expiresInSeconds: OTP_TTL_SECONDS };
  } catch (error) {
    console.error(`[OTP] Error in requestOtp:`, error.message, error.stack);
    throw error;
  }
}

export async function verifyOtp(phone, code, role, deviceId) {
  const stored = await redis.get(otpKey(phone));
  console.log(`[OTP] Verifying: phone=${phone}, provided=${code}, stored=${stored}, match=${stored === code}`);
  if (!stored || stored !== code) {
    console.log(`[OTP] Verification failed - throwing error`);
    throw new AppError(400, "Invalid or expired OTP");
  }
  console.log(`[OTP] Verification successful!`);
  await redis.del(otpKey(phone)); // one-time use

  let user = await User.findOne({ where: { phone } });
  if (!user) {
    if (!role) throw new AppError(400, "role is required for first-time signup");
    user = await User.create({ phone, primaryRole: role });
  }

  return issueTokens(user.id, user.primaryRole, deviceId);
}

export async function refresh(rawToken) {
  let payload;
  try {
    payload = jwt.verify(rawToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError(401, "Invalid refresh token");
  }

  const stored = await RefreshToken.findOne({
    where: { id: payload.sessionId, userId: payload.sub, revokedAt: null },
  });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, "Refresh token expired or revoked");
  }
  const matches = await bcrypt.compare(rawToken, stored.tokenHash);
  if (!matches) throw new AppError(401, "Refresh token mismatch");

  await stored.update({ revokedAt: new Date() }); // rotate

  const user = await User.findByPk(payload.sub);
  return issueTokens(user.id, user.primaryRole, stored.deviceId);
}

export async function logout(userId, sessionId) {
  await RefreshToken.update(
    { revokedAt: new Date() },
    { where: { id: sessionId, userId, revokedAt: null } },
  );
  return { message: "Logged out" };
}

// Demo-only: bypass OTP for testing the dashboard
export async function demoLogin(phone, role, deviceId) {
  if (process.env.NODE_ENV === "production") {
    throw new AppError(403, "Demo login not allowed in production");
  }
  
  let user = await User.findOne({ where: { phone } });
  if (!user) {
    if (!role) throw new AppError(400, "role is required for first-time signup");
    user = await User.create({ phone, primaryRole: role });
  }
  
  console.log(`[DEMO] Logged in user ${user.id} (${phone}) as ${role}`);
  return issueTokens(user.id, user.primaryRole, deviceId);
}

async function issueTokens(userId, role, deviceId) {
  const membership = await OrganizationMember.findOne({ where: { userId } });
  const sessionId = nanoid();

  const accessToken = jwt.sign(
    { sub: userId, role, orgId: membership?.organizationId, sessionId },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL },
  );
  const refreshToken = jwt.sign({ sub: userId, sessionId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: `${REFRESH_TOKEN_TTL_DAYS}d`,
  });

  const tokenHash = await bcrypt.hash(refreshToken, 10);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await RefreshToken.create({ id: sessionId, userId, tokenHash, deviceId, expiresAt });

  return { accessToken, refreshToken, userId, role };
}
