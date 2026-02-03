-- Etapa 04: budgets (status enum, unique company+budget_number, soft delete, FKs) e geração de contas a receber
-- financial_accounts: category_id, department_id, bank_account_id opcionais; FK budget_id → budgets

-- 1) Enums
CREATE TYPE "BudgetStatus" AS ENUM ('draft', 'sent', 'approved', 'canceled');
CREATE TYPE "BudgetItemType" AS ENUM ('service', 'material');

-- 2) financial_accounts: tornar category_id, department_id, bank_account_id nullable; FK budget_id
ALTER TABLE "financial_accounts" ALTER COLUMN "category_id" DROP NOT NULL;
ALTER TABLE "financial_accounts" ALTER COLUMN "department_id" DROP NOT NULL;
ALTER TABLE "financial_accounts" ALTER COLUMN "bank_account_id" DROP NOT NULL;
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "financial_accounts_budget_id_idx" ON "financial_accounts"("budget_id");

-- 3) budgets: novas colunas e ajustes
ALTER TABLE "budgets" ADD COLUMN IF NOT EXISTS "discount_value" DECIMAL(14,2) DEFAULT 0;
ALTER TABLE "budgets" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "budgets" ADD COLUMN IF NOT EXISTS "created_by_user_id" TEXT;
ALTER TABLE "budgets" ADD COLUMN IF NOT EXISTS "updated_by_user_id" TEXT;

UPDATE "budgets" SET "budget_number" = "id" WHERE "budget_number" IS NULL;
UPDATE "budgets" SET "total_amount" = 0 WHERE "total_amount" IS NULL;
UPDATE "budgets" SET "total_services" = 0 WHERE "total_services" IS NULL;
UPDATE "budgets" SET "total_materials" = 0 WHERE "total_materials" IS NULL;
UPDATE "budgets" SET "installment_count" = 1 WHERE "installment_count" IS NULL;
UPDATE "budgets" SET "created_by_user_id" = 'system', "updated_by_user_id" = 'system' WHERE "created_by_user_id" IS NULL;

ALTER TABLE "budgets" ALTER COLUMN "budget_number" SET NOT NULL;
ALTER TABLE "budgets" ALTER COLUMN "total_amount" SET NOT NULL;
ALTER TABLE "budgets" ALTER COLUMN "total_services" SET NOT NULL;
ALTER TABLE "budgets" ALTER COLUMN "total_materials" SET NOT NULL;
ALTER TABLE "budgets" ALTER COLUMN "installment_count" SET NOT NULL;
ALTER TABLE "budgets" ALTER COLUMN "installment_count" SET DEFAULT 1;
ALTER TABLE "budgets" ALTER COLUMN "created_by_user_id" SET NOT NULL;
ALTER TABLE "budgets" ALTER COLUMN "updated_by_user_id" SET NOT NULL;

-- status: migrar TEXT para enum
ALTER TABLE "budgets" ADD COLUMN "status_new" "BudgetStatus" NOT NULL DEFAULT 'draft';
UPDATE "budgets" SET "status_new" = CASE
  WHEN LOWER("status"::text) IN ('approved','aprovado') THEN 'approved'::"BudgetStatus"
  WHEN LOWER("status"::text) IN ('sent','enviado') THEN 'sent'::"BudgetStatus"
  WHEN LOWER("status"::text) IN ('canceled','cancelled','cancelado') THEN 'canceled'::"BudgetStatus"
  ELSE 'draft'::"BudgetStatus"
END WHERE "status" IS NOT NULL;
ALTER TABLE "budgets" DROP COLUMN "status";
ALTER TABLE "budgets" RENAME COLUMN "status_new" TO "status";

-- UNIQUE (company_id, budget_number): garantir unicidade antes de criar índice
UPDATE "budgets" b SET "budget_number" = b."budget_number" || '-' || b."id"
WHERE EXISTS (
  SELECT 1 FROM "budgets" b2
  WHERE b2."company_id" = b."company_id" AND b2."budget_number" = b."budget_number" AND b2."id" < b."id"
);
CREATE UNIQUE INDEX IF NOT EXISTS "budgets_company_budget_number_unique" ON "budgets"("company_id", "budget_number");

-- FKs budgets (client_id, category_id, department_id, bank_account_id já existem como colunas)
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Remover colunas antigas que não existem mais no modelo (evitar conflito com Prisma)
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "stage";
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "client_full_name";
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "client_document";
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "client_tags";
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "contact_name";
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "payment_method_label";
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "bank_account_name";
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "category_name";
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "advance_payment_status";
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "billed_at";
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "billed_by";
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "rps_date";
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "client_order_number";
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "project_name";
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "contract_number";
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "construction_code";
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "art_code";
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "product_remittance";
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "canceled_at";
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "created_by";

-- 4) budget_items: company_id, budget_id NOT NULL, item_type enum, description/quantity/unit_price/line_total NOT NULL, updated_at, created_by_user_id, updated_by_user_id
ALTER TABLE "budget_items" ADD COLUMN IF NOT EXISTS "company_id" TEXT;
UPDATE "budget_items" bi SET "company_id" = b."company_id" FROM "budgets" b WHERE bi."budget_id" = b."id";
DELETE FROM "budget_items" WHERE "budget_id" IS NULL OR "company_id" IS NULL;
UPDATE "budget_items" SET "budget_id" = (SELECT "id" FROM "budgets" LIMIT 1) WHERE "budget_id" IS NULL;
ALTER TABLE "budget_items" ALTER COLUMN "budget_id" SET NOT NULL;
ALTER TABLE "budget_items" ALTER COLUMN "company_id" SET NOT NULL;

ALTER TABLE "budget_items" ADD COLUMN IF NOT EXISTS "item_type_new" "BudgetItemType" NOT NULL DEFAULT 'service';
UPDATE "budget_items" SET "item_type_new" = CASE WHEN LOWER(COALESCE("item_type",'')::text) = 'material' THEN 'material'::"BudgetItemType" ELSE 'service'::"BudgetItemType" END;
ALTER TABLE "budget_items" DROP COLUMN IF EXISTS "item_type";
ALTER TABLE "budget_items" RENAME COLUMN "item_type_new" TO "item_type";

UPDATE "budget_items" SET "description" = '' WHERE "description" IS NULL;
UPDATE "budget_items" SET "quantity" = 0 WHERE "quantity" IS NULL;
UPDATE "budget_items" SET "unit_price" = 0 WHERE "unit_price" IS NULL;
UPDATE "budget_items" SET "line_total" = 0 WHERE "line_total" IS NULL;
ALTER TABLE "budget_items" ALTER COLUMN "description" SET NOT NULL;
ALTER TABLE "budget_items" ALTER COLUMN "quantity" SET NOT NULL;
ALTER TABLE "budget_items" ALTER COLUMN "unit_price" SET NOT NULL;
ALTER TABLE "budget_items" ALTER COLUMN "line_total" SET NOT NULL;
ALTER TABLE "budget_items" ADD COLUMN IF NOT EXISTS "discount_percent" DECIMAL(14,2) DEFAULT 0;
ALTER TABLE "budget_items" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "budget_items" ADD COLUMN IF NOT EXISTS "created_by_user_id" TEXT NOT NULL DEFAULT 'system';
ALTER TABLE "budget_items" ADD COLUMN IF NOT EXISTS "updated_by_user_id" TEXT NOT NULL DEFAULT 'system';
ALTER TABLE "budget_items" DROP COLUMN IF EXISTS "detailed_description";

ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "budget_items_company_id_idx" ON "budget_items"("company_id");
