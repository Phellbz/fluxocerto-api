-- AlterTable: contacts - alinhar campos ao Supabase (defaults para não quebrar registros antigos)

-- 1) company_id: permitir NULL (conforme Supabase)
ALTER TABLE "contacts" ALTER COLUMN "company_id" DROP NOT NULL;

-- 2) Colunas NOT NULL com default (não quebram registros antigos)
ALTER TABLE "contacts" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'customer';
ALTER TABLE "contacts" ADD COLUMN "document" TEXT NOT NULL DEFAULT '';

-- 3) name e trade_name: garantir default para novos registros
ALTER TABLE "contacts" ALTER COLUMN "name" SET DEFAULT '';
UPDATE "contacts" SET "trade_name" = '' WHERE "trade_name" IS NULL;
ALTER TABLE "contacts" ALTER COLUMN "trade_name" SET NOT NULL;
ALTER TABLE "contacts" ALTER COLUMN "trade_name" SET DEFAULT '';

-- 4) Colunas opcionais (nullable)
ALTER TABLE "contacts" ADD COLUMN "phone" TEXT;
ALTER TABLE "contacts" ADD COLUMN "email" TEXT;
ALTER TABLE "contacts" ADD COLUMN "city" TEXT;
ALTER TABLE "contacts" ADD COLUMN "state" TEXT;
ALTER TABLE "contacts" ADD COLUMN "address" TEXT;
ALTER TABLE "contacts" ADD COLUMN "neighborhood" TEXT;
ALTER TABLE "contacts" ADD COLUMN "zip_code" TEXT;
ALTER TABLE "contacts" ADD COLUMN "created_by" TEXT;

-- 5) updated_at (Prisma @updatedAt)
ALTER TABLE "contacts" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
