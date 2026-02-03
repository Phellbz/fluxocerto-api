-- Etapa 05: hardening (partial uniques, check constraints, performance indices)
-- Nomes físicos Postgres conforme schema Prisma (@map): occurred_at, document, company_id, total_amount, amount, paid_total, paid_amount, due_date, payment_id, etc.

-- 3.1 Partial unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "companies_document_unique_not_null"
ON "companies" ("document")
WHERE "document" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "contacts_company_document_unique_not_null"
ON "contacts" ("company_id", "document")
WHERE "document" IS NOT NULL;

-- 3.2 Check constraints (idempotent via pg_constraint)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'financial_accounts_total_amount_positive'
  ) THEN
    ALTER TABLE "financial_accounts"
    ADD CONSTRAINT financial_accounts_total_amount_positive
    CHECK ("total_amount" > 0);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'installments_amount_positive'
  ) THEN
    ALTER TABLE "installments"
    ADD CONSTRAINT installments_amount_positive
    CHECK ("amount" > 0);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'installments_paid_total_valid'
  ) THEN
    ALTER TABLE "installments"
    ADD CONSTRAINT installments_paid_total_valid
    CHECK ("paid_total" >= 0 AND "paid_total" <= "amount");
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_amounts_valid'
  ) THEN
    ALTER TABLE "financial_account_payments"
    ADD CONSTRAINT payments_amounts_valid
    CHECK (
      "paid_amount" > 0
      AND "interest" >= 0
      AND "discount" >= 0
    );
  END IF;
END$$;

-- 3.3 Performance indices (company_id + created_at on transactional tables)
CREATE INDEX IF NOT EXISTS "idx_financial_accounts_company_created_at"
ON "financial_accounts" ("company_id", "created_at");

CREATE INDEX IF NOT EXISTS "idx_installments_company_created_at"
ON "installments" ("company_id", "created_at");

CREATE INDEX IF NOT EXISTS "idx_payments_company_created_at"
ON "financial_account_payments" ("company_id", "created_at");

CREATE INDEX IF NOT EXISTS "idx_budgets_company_created_at"
ON "budgets" ("company_id", "created_at");

CREATE INDEX IF NOT EXISTS "idx_budget_items_company_created_at"
ON "budget_items" ("company_id", "created_at");

-- movements: coluna física é occurred_at
CREATE INDEX IF NOT EXISTS "idx_movements_company_occurred_at"
ON "movements" ("company_id", "occurred_at");

CREATE INDEX IF NOT EXISTS "idx_installments_company_due_date"
ON "installments" ("company_id", "due_date");

CREATE INDEX IF NOT EXISTS "idx_movements_bank_account_id"
ON "movements" ("bank_account_id");

CREATE INDEX IF NOT EXISTS "idx_movements_category_id"
ON "movements" ("category_id");

CREATE INDEX IF NOT EXISTS "idx_movements_contact_id"
ON "movements" ("contact_id");

CREATE INDEX IF NOT EXISTS "idx_movements_department_id"
ON "movements" ("department_id");

-- 3.4 Unique 1:1 payments → movements (partial: only when payment_id IS NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS "movements_payment_id_unique_not_null"
ON "movements" ("payment_id")
WHERE "payment_id" IS NOT NULL;
