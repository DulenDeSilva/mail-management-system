/*
  Warnings:

  - You are about to drop the `outlookconnection` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `workerEmail` to the `MailLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workerName` to the `MailLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `outlookconnection` DROP FOREIGN KEY `OutlookConnection_userId_fkey`;

-- AlterTable
ALTER TABLE `maillog` ADD COLUMN `workerEmail` VARCHAR(191) NOT NULL,
    ADD COLUMN `workerName` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `outlookconnection`;
