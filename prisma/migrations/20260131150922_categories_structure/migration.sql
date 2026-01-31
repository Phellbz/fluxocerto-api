/*
  Warnings:

  - You are about to alter the column `opening_balance` on the `bank_accounts` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,30)`.
  - Made the column `group_name` on table `categories` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "bank_accounts" ALTER COLUMN "opening_balance" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "group_name" SET NOT NULL;
