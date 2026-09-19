import { jest } from "@jest/globals";

// Notification delivery goes to MySQL, which this suite doesn't spin up —
// mock it out so these tests only depend on Postgres + Redis, matching
// what auth actually needs to function.
jest.unstable_mockModule("../src/services/notificationsService.js", () => ({
  sendNotification: jest.fn().mockResolvedValue(undefined),
}));

const { redis } = await import("../src/config/redis.js");
const authService = await import("../src/services/authService.js");

const PHONE = "+919900001234";

describe("auth service — OTP + token issuance", () => {
  afterEach(async () => {
    await redis.del(authService.otpKey(PHONE));
  });

  test("requesting an OTP stores a 6-digit code in Redis with a TTL", async () => {
    await authService.requestOtp(PHONE);
    const stored = await redis.get(authService.otpKey(PHONE));
    expect(stored).toMatch(/^\d{6}$/);

    const ttl = await redis.ttl(authService.otpKey(PHONE));
    expect(ttl).toBeGreaterThan(0);
  });

  test("verifying with the correct code issues tokens and consumes the OTP", async () => {
    await authService.requestOtp(PHONE);
    const code = await redis.get(authService.otpKey(PHONE));

    const result = await authService.verifyOtp(PHONE, code, "SHIPPER");
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.role).toBe("SHIPPER");

    // one-time use — the same code must not verify again
    await expect(authService.verifyOtp(PHONE, code, "SHIPPER")).rejects.toMatchObject({ status: 400 });
  });

  test("verifying with the wrong code fails", async () => {
    await authService.requestOtp(PHONE);
    await expect(authService.verifyOtp(PHONE, "000000", "SHIPPER")).rejects.toMatchObject({ status: 400 });
  });

  test("refreshing rotates the refresh token — the old one no longer works", async () => {
    await authService.requestOtp(PHONE);
    const code = await redis.get(authService.otpKey(PHONE));
    const first = await authService.verifyOtp(PHONE, code, "SHIPPER");

    const refreshed = await authService.refresh(first.refreshToken);
    expect(refreshed.accessToken).toBeTruthy();
    expect(refreshed.refreshToken).not.toBe(first.refreshToken);

    await expect(authService.refresh(first.refreshToken)).rejects.toMatchObject({ status: 401 });
  });
});
