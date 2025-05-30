"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMagicLinkEmail = sendMagicLinkEmail;
const dotenv_1 = require("dotenv");
const resend_1 = require("resend");
(0, dotenv_1.config)();
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
function sendMagicLinkEmail(_a) {
    return __awaiter(this, arguments, void 0, function* ({ email, token, url, }) {
        try {
            const { data, error } = yield resend.emails.send({
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
            if (error) {
                console.log("An error occured while sending email: ", error);
                return;
            }
            console.log(`✅ Magic link sent to ${email}`, data);
        }
        catch (err) {
            console.error(`❌ Failed to send magic link to ${email}:`, err);
            throw new Error("Could not send magic link");
        }
    });
}
