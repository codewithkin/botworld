import {config} from "dotenv";
import {Resend} from "resend";

config();

const resend = new Resend("re_123");

type EmailContent = {
  subject: string;
  html: string;
  text?: string;
};

type SendNotificationEmailParams = {
  to: string;
  content: EmailContent;
  from?: string;
};

/**
 * Sends a notification email using Resend
 * @param {SendNotificationEmailParams} params - Email parameters
 * @returns {Promise<{data?: any, error?: Error}>} - Result object
 */
export async function sendNotificationEmail({
  to,
  content,
  from = "no-reply@botworld.pro",
}: SendNotificationEmailParams): Promise<{data?: any; error?: Error}> {
  try {
    // Validate required fields
    if (!to || !content.subject || !content.html) {
      throw new Error("Missing required email fields");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error("Invalid recipient email format");
    }

    // Send email using Resend
    const data = await resend.emails.send({
      from,
      to,
      subject: content.subject,
      html: content.html,
      text: content.text || stripHtml(content.html),
    });

    return {data};
  } catch (error) {
    console.error("Email sending failed:", error);

    // Return normalized error
    const emailError =
      error instanceof Error ? error : new Error("Failed to send email");

    return {error: emailError};
  }
}

// Helper function to create text version from HTML
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>?/gm, "") // Remove HTML tags
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();
}
