-- AlterTable: services - add deleted_at, expand fiscal fields
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "municipal_service_description" TEXT;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "default_deduction_cents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "default_quantity" DECIMAL(18,6);
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "default_discount_rate" DECIMAL(18,10);

ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "inss_rate" DECIMAL(9,4);
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "withhold_inss" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "deduct_iss_from_pis_cofins_base" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "inform_tax_value_instead_of_rate" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "nbs_description" TEXT;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "ibpt_federal_rate" DECIMAL(9,2) NOT NULL DEFAULT 0;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "ibpt_state_rate" DECIMAL(9,2) NOT NULL DEFAULT 0;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "ibpt_municipal_rate" DECIMAL(9,2) NOT NULL DEFAULT 0;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "ibpt_source_note" TEXT;

ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "reform_recipient" TEXT;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "cst_code" TEXT;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "cst_description" TEXT;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "tax_classification_code" TEXT;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "tax_classification_description" TEXT;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "operation_indicator_code" TEXT;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "operation_indicator_description" TEXT;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "ibs_municipal_rate" DECIMAL(9,4) NOT NULL DEFAULT 0;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "ibs_state_rate" DECIMAL(9,4) NOT NULL DEFAULT 0;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "cbs_rate" DECIMAL(9,4) NOT NULL DEFAULT 0;
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "personal_use_consumption" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "services_company_created_idx" ON "services"("company_id", "created_at");
