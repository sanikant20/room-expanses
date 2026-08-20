/**
 * Best-effort email sending via Resend (free tier) using the HTTP API.
 *
 * No third-party npm dependency — uses global fetch. If RESEND_API_KEY is not
 * set, sending is skipped silently (in-app notifications still work).
 * Failures are logged, never thrown, so email can never break a request.
 */

const RESEND_URL = "https://api.resend.com/emails";

const fromAddress = () => {
  const from = process.env.EMAIL_FROM;
  if (from) return from;
  const domain = process.env.RESEND_DOMAIN || "onboarding@resend.dev";
  return domain;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[email] skipped: RESEND_API_KEY not set");
    return { skipped: true };
  }

  try {
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: Array.isArray(to) ? to : [to],
        subject,
        ...(html ? { html } : {}),
        ...(text ? { text } : {}),
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[email] send failed (${response.status}): ${body}`);
      return { skipped: false, error: body };
    }

    console.log(`[email] sent to ${to} — "${subject}"`);
    return { skipped: false, sent: true };
  } catch (error) {
    console.error("[email] send error:", error.message);
    return { skipped: false, error: error.message };
  }
};