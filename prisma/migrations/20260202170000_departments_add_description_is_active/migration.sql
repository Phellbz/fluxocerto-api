-- AlterTable: departments - adicionar description e is_active

ALTER TABLE "departments" ADD COLUMN "description" TEXT;

ALTER TABLE "departments" ADD COLUMN "is_active" BOOLEAN DEFAULT true;
