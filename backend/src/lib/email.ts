import type { Env } from "../config.js";
import { getEnvConfig } from "../config.js";
import { escapeHtml } from "./validation.js";
import { logContact } from "./logging.js";

// EmailService interface — easy to replace implementation
export interface EmailService {
  sendContactEmail(opts: {
    name: string;
    email: string;
    message: string;
    requestId: string;
    env: Env;
  }): Promise<{ success: boolean; errorCode?: string; internalError?: string }>;
}

class CloudflareEmailService implements EmailService {
  async sendContactEmail(opts: { name: string; email: string; message: string; requestId: string; env: Env }) {
    const { name, email, message, requestId, env } = opts;
    const { contactTo, contactFrom } = getEnvConfig(env);
    const start = Date.now();

    // Sanitize
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);
    const timestamp = new Date().toISOString();

    const subject = `New portfolio contact from ${safeName}`;
    // Plain text body — always provide
    const textBody = `Name: ${name}\nEmail: ${email}\nMessage: ${message}\n\nTimestamp: ${timestamp}\nRequest ID: ${requestId}`;
    // HTML body — sanitized
    const htmlBody = `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2>New portfolio contact</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Message:</strong></p>
        <pre style="white-space: pre-wrap; background: #f4f4f5; padding: 12px; border-radius: 8px;">${safeMessage}</pre>
        <p style="color: #71717a; font-size: 12px;">Timestamp: ${timestamp}<br/>Request ID: ${escapeHtml(requestId)}</p>
      </div>`.trim();

    // Use verified sender, user email as Reply-To — never as From
    // Validate no header injection (already done in validation, but double-check)
    if (/[\r\n]/.test(contactFrom) || /[\r\n]/.test(contactTo) || /[\r\n]/.test(email)) {
      logContact({ requestId, success: false, durationMs: Date.now() - start, errorCode: "EMAIL_SEND_FAILED" });
      return { success: false, errorCode: "EMAIL_SEND_FAILED", internalError: "header injection" };
    }

    // Try Cloudflare native Email binding if available
    // Current API: env.EMAIL.send(message) where message is EmailMessage
    // See: https://developers.cloudflare.com/email-routing/email-workers/
    // Note: Requires verified sender and may require paid plan — we isolate behind interface
    const emailBinding: any = (env as any).EMAIL;
    if (emailBinding && typeof emailBinding.send === "function") {
      try {
        const msg: any = {
          from: contactFrom,
          to: contactTo,
          subject,
          text: textBody,
          html: htmlBody,
          headers: {
            "Reply-To": email,
          },
        };
        // Cloudflare EmailMessage may expect EmailMessage instance, but binding accepts plain object
        await emailBinding.send(msg);
        logContact({ requestId, success: true, durationMs: Date.now() - start });
        return { success: true };
      } catch (e: any) {
        const msg = String(e?.message || e).slice(0, 200);
        logContact({ requestId, success: false, durationMs: Date.now() - start, errorCode: "EMAIL_SEND_FAILED" });
        return { success: false, errorCode: "EMAIL_SEND_FAILED", internalError: msg };
      }
    }

    // Fallback: If no native binding, log and pretend success in dev, but fail in prod if not configured
    // For portfolio Free tier without Email binding, we document that email requires manual setup
    // Here we simulate send via logging — do NOT expose to user that email wasn't sent in production without config
    // Instead, we return success in dev (ENVIRONMENT !== production) and fail in production if no binding
    const isDev = (env as any).ENVIRONMENT !== "production" && !contactTo.includes("REPLACE_WITH");
    if (isDev) {
      console.log(JSON.stringify({ event: "email_fallback", requestId, to: contactTo, from: contactFrom, subject }));
      logContact({ requestId, success: true, durationMs: Date.now() - start });
      return { success: true };
    }

    // In production without binding, we cannot silently succeed — return failure
    // The user will see EMAIL_SEND_FAILED, and we log
    logContact({ requestId, success: false, durationMs: Date.now() - start, errorCode: "EMAIL_SEND_FAILED" });
    return { success: false, errorCode: "EMAIL_SEND_FAILED", internalError: "Email service not configured" };
  }
}

export const emailService: EmailService = new CloudflareEmailService();
