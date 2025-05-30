"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.prisma = void 0;
const better_auth_1 = require("better-auth");
const prisma_1 = require("better-auth/adapters/prisma");
const plugins_1 = require("better-auth/plugins");
const sendMagicLink_1 = require("./email/sendMagicLink");
const prisma_2 = require("../../prisma/generated/prisma");
exports.prisma = new prisma_2.PrismaClient();
exports.auth = (0, better_auth_1.betterAuth)({
    database: (0, prisma_1.prismaAdapter)(exports.prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
    },
    plugins: [
        (0, plugins_1.magicLink)({
            sendMagicLink: sendMagicLink_1.sendMagicLinkEmail,
        }),
    ],
    trustedOrigins: [
        "http://localhost:8080",
        "http://localhost:3000",
        "https://app.botworld.pro",
        "https://api.botworld.pro",
    ],
});
