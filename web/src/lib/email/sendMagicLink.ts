import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMagicLinkEmail({
  email,
  token,
  url,
}: {
  email: string;
  token: string;
  url: string;
}) {
  try {
    const { data } = await resend.emails.send({
      from: "BotWorld 🪄 <no-reply@botworld.pro>",
      to: email,
      subject: "Your Magic Link is Here! ✨",
      html: `
        <div style="font-family: 'Poppins', sans-serif; padding: 24px; background: #fefefe; border-radius: 12px; border: 1px solid #eee;">
          <h2 style="color: #222;">Hey there 👋</h2>
          <p style="font-size: 16px; color: #333;">Welcome to <strong>BotWorld</strong>! Here's your magic link to log in:</p>
          
          <a href="${url}" style="display: inline-block; margin: 16px 0; background-color: oklch(54.6% 0.245 262.881); color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Click here to sign in
          </a>

          <p style="font-size: 14px; color: #666;">This link will expire shortly. If you didn't request this, you can safely ignore this email. 😊</p>

          <p style="margin-top: 24px; font-size: 13px; color: #999;">— The BotWorld Team</p>
        </div>
      `,
    });

    console.log(`✅ Magic link sent to ${email}`, data?.id);
  } catch (err) {
    console.error(`❌ Failed to send magic link to ${email}:`, err);
    throw new Error("Could not send magic link");
  }
}
