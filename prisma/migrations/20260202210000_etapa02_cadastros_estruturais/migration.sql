-- Etapa 02: cadastros estruturais multi-empresa
-- FK companies(id) ON DELETE RESTRICT, enums, uniques, is_active, updated_at

-- 1) Garantir que exista company para todo company_id referenciado (para as FKs)
INSERT INTO "companies" ("id", "name", "document", "is_active", "created_at", "updated_at")
SELECT d.id, 'Empresa ' || LEFT(d.id::text, 8), NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT "company_id" AS id FROM "bank_accounts"
  UNION SELECT DISTINCT "company_id" FROM "contacts" WHERE "company_id" IS NOT NULL
  UNION SELECT DISTINCT "company_id" FROM "categories"
  UNION SELECT DISTINCT "company_id" FROM "departments"
  UNION SELECT DISTINCT "company_id" FROM "products"
) d
WHERE NOT EXISTS (SELECT 1 FROM "companies" c WHERE c.id = d.id);

-- 2) Contacts: preencher company_id nulos (depois de 20260202160000) com primeira company
UPDATE "contacts" SET "company_id" = (SELECT id FROM "companies" LIMIT 1) WHERE "company_id" IS NULL;
ALTER TABLE "contacts" ALTER COLUMN "company_id" SET NOT NULL;

-- 3) Enums
CREATE TYPE "BankAccountType" AS ENUM ('checking', 'savings', 'cash');
CREATE TYPE "ContactType" AS ENUM ('client', 'supplier', 'both');

-- 4) bank_accounts: updated_at, account_type enum, opening_balance tipo, unique, FK
ALTER TABLE "bank_accounts" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "bank_accounts" SET "account_type" = 'checking' WHERE "account_type" IS NULL OR "account_type" = '';
ALTER TABLE "bank_accounts" ADD COLUMN "account_type_new" "BankAccountType" NOT NULL DEFAULT 'checking';
UPDATE "bank_accounts" SET "account_type_new" = CASE
  WHEN "account_type"::text = 'checking' THEN 'checking'::"BankAccountType"
  WHEN "account_type"::text = 'savings' THEN 'savings'::"BankAccountType"
  WHEN "account_type"::text = 'cash' THEN 'cash'::"BankAccountType"
  ELSE 'checking'::"BankAccountType"
END;
ALTER TABLE "bank_accounts" DROP COLUMN "account_type";
ALTER TABLE "bank_accounts" RENAME COLUMN "account_type_new" TO "account_type";
ALTER TABLE "bank_accounts" ALTER COLUMN "opening_balance" TYPE DECIMAL(14,2) USING ("opening_balance"::decimal(14,2));
CREATE UNIQUE INDEX IF NOT EXISTS "bank_accounts_company_name_unique" ON "bank_accounts"("company_id", "name");
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5) contacts: type enum, document nullable, is_active, partial unique, FK
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;
UPDATE "contacts" SET "type" = 'client' WHERE "type" IS NULL OR "type" = 'customer';
ALTER TABLE "contacts" ADD COLUMN "type_new" "ContactType" NOT NULL DEFAULT 'client';
UPDATE "contacts" SET "type_new" = CASE
  WHEN "type"::text = 'client' THEN 'client'::"ContactType"
  WHEN "type"::text = 'supplier' THEN 'supplier'::"ContactType"
  WHEN "type"::text = 'both' THEN 'both'::"ContactType"
  ELSE 'client'::"ContactType"
END;
ALTER TABLE "contacts" DROP COLUMN "type";
ALTER TABLE "contacts" RENAME COLUMN "type_new" TO "type";
UPDATE "contacts" SET "document" = NULL WHERE "document" = '';
ALTER TABLE "contacts" ALTER COLUMN "document" DROP NOT NULL;
ALTER TABLE "contacts" ALTER COLUMN "document" DROP DEFAULT;
CREATE UNIQUE INDEX "contacts_company_document_unique" ON "contacts"("company_id", "document") WHERE "document" IS NOT NULL;
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6) categories: is_system, updated_at, FK (unique company+name já existe em 20260202150000)
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "is_system" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "categories" ADD CONSTRAINT "categories_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 7) departments: updated_at, is_active NOT NULL, unique, FK
ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "departments" SET "is_active" = true WHERE "is_active" IS NULL;
ALTER TABLE "departments" ALTER COLUMN "is_active" SET NOT NULL;
ALTER TABLE "departments" ALTER COLUMN "is_active" SET DEFAULT true;
CREATE UNIQUE INDEX IF NOT EXISTS "departments_company_name_unique" ON "departments"("company_id", "name");
ALTER TABLE "departments" ADD CONSTRAINT "departments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 8) products: codigo_produto/descricao NOT NULL, is_active, unique, FK
UPDATE "products" SET "codigo_produto" = '' WHERE "codigo_produto" IS NULL;
UPDATE "products" SET "descricao" = '' WHERE "descricao" IS NULL;
ALTER TABLE "products" ALTER COLUMN "codigo_produto" SET NOT NULL;
ALTER TABLE "products" ALTER COLUMN "codigo_produto" SET DEFAULT '';
ALTER TABLE "products" ALTER COLUMN "descricao" SET NOT NULL;
ALTER TABLE "products" ALTER COLUMN "descricao" SET DEFAULT '';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;
CREATE UNIQUE INDEX IF NOT EXISTS "products_company_codigo_unique" ON "products"("company_id", "codigo_produto");
ALTER TABLE "products" ADD CONSTRAINT "products_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
