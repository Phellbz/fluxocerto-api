-- CreateTable: services (catálogo de serviços multi-empresa)
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "integration_code" TEXT,
    "service_code" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "service_taxation" TEXT NOT NULL,
    "municipal_service_code" TEXT,
    "lc116_code" TEXT,
    "nbs_code" TEXT,
    "unit_price_cents" INTEGER,
    "full_description" TEXT,
    "iss_rate" DECIMAL(5,2),
    "withhold_iss" BOOLEAN NOT NULL DEFAULT false,
    "pis_rate" DECIMAL(5,2),
    "withhold_pis" BOOLEAN NOT NULL DEFAULT false,
    "cofins_rate" DECIMAL(5,2),
    "withhold_cofins" BOOLEAN NOT NULL DEFAULT false,
    "csll_rate" DECIMAL(5,2),
    "withhold_csll" BOOLEAN NOT NULL DEFAULT false,
    "ir_rate" DECIMAL(5,2),
    "withhold_ir" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "services" ADD CONSTRAINT "services_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE UNIQUE INDEX "services_company_service_code_unique" ON "services"("company_id", "service_code");
CREATE INDEX "services_company_active_idx" ON "services"("company_id", "is_active");

-- AlterEnum: add 'product' to BudgetItemType
ALTER TYPE "BudgetItemType" ADD VALUE 'product';

-- AlterTable: budget_items - add service_id, snapshots, total_cents
ALTER TABLE "budget_items" ADD COLUMN IF NOT EXISTS "service_id" TEXT;
ALTER TABLE "budget_items" ADD COLUMN IF NOT EXISTS "description_snapshot" TEXT NOT NULL DEFAULT '';
ALTER TABLE "budget_items" ADD COLUMN IF NOT EXISTS "unit_price_cents_snapshot" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "budget_items" ADD COLUMN IF NOT EXISTS "tax_snapshot" JSONB;
ALTER TABLE "budget_items" ADD COLUMN IF NOT EXISTS "total_cents" INTEGER;

UPDATE "budget_items" SET "description_snapshot" = COALESCE("description", '') WHERE "description_snapshot" = '' OR "description_snapshot" IS NULL;
UPDATE "budget_items" SET "unit_price_cents_snapshot" = ROUND((COALESCE("unit_price", 0))::numeric * 100)::integer WHERE "unit_price_cents_snapshot" = 0;
UPDATE "budget_items" SET "total_cents" = ROUND((COALESCE("line_total", 0))::numeric * 100)::integer WHERE "total_cents" IS NULL;

ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
