-- CreateEnum
CREATE TYPE "CategoryFlowType" AS ENUM ('in', 'out');

-- AlterTable
ALTER TABLE "categories" ADD COLUMN "group_id" TEXT;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN "flow_type" "CategoryFlowType" NOT NULL DEFAULT 'out';

-- AlterTable
ALTER TABLE "categories" ADD COLUMN "affects_cash" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
