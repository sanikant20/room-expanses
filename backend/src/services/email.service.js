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
    const from = fromAddress();
    const recipients = Array.isArray(to) ? to : [to];
    console.log(`[email] sending "${subject}" from ${from} to ${recipients.join(", ")}`);

    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        ...(html ? { html } : {}),
        ...(text ? { text } : {}),
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[email] FAILED (${response.status}) to ${recipients.join(", ")} — "${subject}": ${body}`);
      return { skipped: false, error: body };
    }

    console.log(`[email] SENT ✓ to ${recipients.join(", ")} — "${subject}"`);
    return { skipped: false, sent: true };
  } catch (error) {
    console.error(`[email] ERROR sending "${subject}":`, error.message);
    return { skipped: false, error: error.message };
  }
};