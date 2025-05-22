import nodemailer from "nodemailer";

export async function sendMagicLinkEmail({
  email,
  token,
  url,
}: {
  email: string;
  token: string;
  url: string;
}) {
  const transporter = nodemailer.createTransport({
    host: "mail.spacemail.com",
    port: 465,
    secure: true,
    auth: {
      user: "no-reply@botworld.pro",
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"BotWorld 🪄" <${process.env.EMAIL_USER}>`,
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
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Magic link sent to ${email}`);
  } catch (err) {
    console.error(`❌ Failed to send magic link:`, err);
    throw new Error("Could not send magic link");
  }
}
