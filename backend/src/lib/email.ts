import type { Env } from "../config.js";
import { escapeHtml } from "./validation.js";
import { logContact } from "./logging.js";

export interface ContactInput {
  name: string;
  email: string;
  message: string;
}

// Fixed addresses — destination is verified and enforced at Wrangler binding level via
// `destination_address`; code also hardcodes to prevent request-controlled recipient.
export const CONTACT_TO = "chnetajibc@gmail.com";
export const CONTACT_FROM = "noreply@chnetaji.com";

// Single Cloudflare-only implementation — no fallback, no abstraction
export async function sendContactEmail(env: Env, input: ContactInput, requestId: string): Promise<void> {
  const { name, email, message } = input;

  if (!env.EMAIL) {
    logContact({ requestId, success: false, durationMs: 0, errorCode: "EMAIL_SEND_FAILED" });
    throw new Error("Email binding missing");
  }

  const timestamp = new Date().toISOString();
  // Subject safely from validated name — strip CR/LF
  const safeSubjectName = name.replace(/[\r\n]+/g, " ").trim().slice(0, 100);
  const subject = `New portfolio contact from ${safeSubjectName}`;

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);
  const safeRequestId = escapeHtml(requestId);

  const text = `New portfolio contact

Name: ${name}
Email: ${email}
Message:

${message}

Request ID: ${requestId}
Timestamp: ${timestamp}`;

  const html = `<div style="font-family: sans-serif; line-height: 1.5;">
  <h2>New portfolio contact</h2>
  <p><strong>Name:</strong> ${safeName}</p>
  <p><strong>Email:</strong> ${safeEmail}</p>
  <p><strong>Message:</strong></p>
  <pre style="white-space: pre-wrap; background: #f4f4f5; padding: 12px; border-radius: 8px;">${safeMessage}</pre>
  <p style="color: #71717a; font-size: 12px;">Request ID: ${safeRequestId}<br/>Timestamp: ${escapeHtml(timestamp)}</p>
</div>`;

  const start = Date.now();
  try {
    await env.EMAIL.send({
      to: CONTACT_TO,
      from: CONTACT_FROM,
      replyTo: email,
      subject,
      text,
      html,
    });
    logContact({ requestId, success: true, durationMs: Date.now() - start });
  } catch (e) {
    logContact({ requestId, success: false, durationMs: Date.now() - start, errorCode: "EMAIL_SEND_FAILED" });
    throw e;
  }
}
