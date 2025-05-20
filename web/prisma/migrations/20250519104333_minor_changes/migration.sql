/*
  Warnings:

  - You are about to drop the `MessageAnalytics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MessageAnalytics" DROP CONSTRAINT "MessageAnalytics_botId_fkey";

-- DropForeignKey
ALTER TABLE "MessageAnalytics" DROP CONSTRAINT "MessageAnalytics_userId_fkey";

-- DropTable
DROP TABLE "MessageAnalytics";

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "contentSnippet" TEXT NOT NULL,
    "fallback" BOOLEAN NOT NULL,
    "reply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
