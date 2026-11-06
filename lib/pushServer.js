// lib/pushServer.js  (server only)
import "server-only";
import webpush from "web-push";

let ready = false;

/** Returns true when the VAPID keys are set and web-push is configured. */
export function configurePush() {
  if (ready) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subject, pub, priv);
  ready = true;
  return true;
}

/**
 * Sends one notification. Returns { ok:true } or { ok:false, gone:true } when the
 * browser says the subscription no longer exists (we then delete it).
 */
export async function sendPush(sub, payload) {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 12 }
    );
    return { ok: true };
  } catch (err) {
    const gone = err?.statusCode === 404 || err?.statusCode === 410;
    if (!gone) console.error("push failed:", err?.statusCode, err?.body ?? err?.message);
    return { ok: false, gone };
  }
}
