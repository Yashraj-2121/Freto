import { NotificationLog } from "../models/mysql/NotificationLog.js";

/**
 * Records a notification attempt in MySQL (see config/mysql.js for why this
 * lives in its own store) and fires it through the actual channel provider.
 * The provider call is stubbed — wire in MSG91/Twilio/FCM/SES here.
 */
export async function sendNotification({ userId, channel, template, recipient, payload }) {
  try {
    // Try to create log entry in MySQL
    const log = await NotificationLog.create({
      userId,
      channel,
      template,
      recipient,
      status: "QUEUED",
    });

    try {
      // TODO: replace with a real provider call per `channel`.
      if (process.env.NODE_ENV !== "production") {
        console.log(`[dev-only] ${channel} to ${recipient} — template=${template}`, payload ?? "");
      }
      await log.update({ status: "SENT" });
    } catch (err) {
      await log.update({ status: "FAILED", errorMessage: err.message });
    }

    return log;
  } catch (err) {
    // If MySQL table doesn't exist, just log to console (OK for demo mode)
    if (err.original?.sqlMessage?.includes("doesn't exist")) {
      console.log(`[NOTIFICATION-SKIP] MySQL table not migrated. Logging to console instead.`);
      console.log(`[dev-only] ${channel} to ${recipient} — template=${template}`, payload ?? "");
      return { message: "Logged to console (table not available)" };
    }
    // Re-throw other errors
    throw err;
  }
}
