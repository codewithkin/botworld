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
exports.sendNotificationEmail = sendNotificationEmail;
const dotenv_1 = require("dotenv");
const resend_1 = require("resend");
(0, dotenv_1.config)();
const resend = new resend_1.Resend("re_123");
/**
 * Sends a notification email using Resend
 * @param {SendNotificationEmailParams} params - Email parameters
 * @returns {Promise<{data?: any, error?: Error}>} - Result object
 */
function sendNotificationEmail(_a) {
    return __awaiter(this, arguments, void 0, function* ({ to, content, from = "no-reply@botworld.pro", }) {
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
            const data = yield resend.emails.send({
                from,
                to,
                subject: content.subject,
                html: content.html,
                text: content.text || stripHtml(content.html),
            });
            return { data };
        }
        catch (error) {
            console.error("Email sending failed:", error);
            // Return normalized error
            const emailError = error instanceof Error ? error : new Error("Failed to send email");
            return { error: emailError };
        }
    });
}
// Helper function to create text version from HTML
function stripHtml(html) {
    return html
        .replace(/<[^>]*>?/gm, "") // Remove HTML tags
        .replace(/\s+/g, " ") // Collapse whitespace
        .trim();
}
