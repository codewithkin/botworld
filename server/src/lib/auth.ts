import {betterAuth} from "better-auth";
import {prismaAdapter} from "better-auth/adapters/prisma";
import {magicLink} from "better-auth/plugins";
import {sendMagicLinkEmail} from "./email/sendMagicLink";
import {PrismaClient} from "../../prisma/generated/prisma";

export const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: sendMagicLinkEmail,
    }),
  ],
  trustedOrigins: [
    "http://localhost:8080",
    "http://localhost:3000",
    "https://app.botworld.pro",
    "https://api.botworld.pro",
  ],
});
