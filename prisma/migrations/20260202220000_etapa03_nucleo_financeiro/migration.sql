-- Etapa 03: núcleo financeiro (financial_accounts, installments, financial_account_payments, movements.payment_id)

-- 1) Enums
CREATE TYPE "FinancialAccountKind" AS ENUM ('payable', 'receivable');
CREATE TYPE "FinancialAccountStatus" AS ENUM ('open', 'partial', 'paid', 'canceled');
CREATE TYPE "InstallmentStatus" AS ENUM ('open', 'partial', 'paid');

-- 2) financial_accounts
CREATE TABLE "financial_accounts" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "kind" "FinancialAccountKind" NOT NULL,
    "status" "FinancialAccountStatus" NOT NULL,
    "contact_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "budget_id" TEXT,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "description" TEXT NOT NULL,
    "invoice_number" TEXT,
    "issue_date" DATE NOT NULL,
    "is_settled" BOOLEAN NOT NULL DEFAULT false,
    "observations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" TEXT NOT NULL,
    "updated_by_user_id" TEXT NOT NULL,

    CONSTRAINT "financial_accounts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "financial_accounts_company_id_idx" ON "financial_accounts"("company_id");

ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3) installments
CREATE TABLE "installments" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "financial_account_id" TEXT NOT NULL,
    "installment_number" INTEGER NOT NULL,
    "due_date" DATE NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "paid_total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "InstallmentStatus" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" TEXT NOT NULL,
    "updated_by_user_id" TEXT NOT NULL,

    CONSTRAINT "installments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "installments_company_id_idx" ON "installments"("company_id");
CREATE INDEX "installments_financial_account_id_idx" ON "installments"("financial_account_id");

ALTER TABLE "installments" ADD CONSTRAINT "installments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "installments" ADD CONSTRAINT "installments_financial_account_id_fkey" FOREIGN KEY ("financial_account_id") REFERENCES "financial_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4) financial_account_payments
CREATE TABLE "financial_account_payments" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "financial_account_id" TEXT NOT NULL,
    "installment_id" TEXT,
    "bank_account_id" TEXT NOT NULL,
    "payment_date" DATE NOT NULL,
    "paid_amount" DECIMAL(14,2) NOT NULL,
    "interest" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" TEXT NOT NULL,
    "updated_by_user_id" TEXT NOT NULL,

    CONSTRAINT "financial_account_payments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "financial_account_payments_company_id_idx" ON "financial_account_payments"("company_id");
CREATE INDEX "financial_account_payments_financial_account_id_idx" ON "financial_account_payments"("financial_account_id");
CREATE INDEX "financial_account_payments_installment_id_idx" ON "financial_account_payments"("installment_id");

ALTER TABLE "financial_account_payments" ADD CONSTRAINT "financial_account_payments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "financial_account_payments" ADD CONSTRAINT "financial_account_payments_financial_account_id_fkey" FOREIGN KEY ("financial_account_id") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "financial_account_payments" ADD CONSTRAINT "financial_account_payments_installment_id_fkey" FOREIGN KEY ("installment_id") REFERENCES "installments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "financial_account_payments" ADD CONSTRAINT "financial_account_payments_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5) movements: add payment_id (1:1 com financial_account_payments, ON DELETE SET NULL)
ALTER TABLE "movements" ADD COLUMN "payment_id" TEXT;

CREATE UNIQUE INDEX "movements_payment_id_key" ON "movements"("payment_id");

ALTER TABLE "movements" ADD CONSTRAINT "movements_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "financial_account_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "movements_payment_id_idx" ON "movements"("payment_id");
