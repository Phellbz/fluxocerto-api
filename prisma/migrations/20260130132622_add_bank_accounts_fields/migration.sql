-- Add new columns to bank_accounts (ADD COLUMN IF NOT EXISTS for idempotency)
ALTER TABLE "bank_accounts" ADD COLUMN IF NOT EXISTS "account_type" TEXT;
ALTER TABLE "bank_accounts" ADD COLUMN IF NOT EXISTS "opening_balance" NUMERIC;
ALTER TABLE "bank_accounts" ADD COLUMN IF NOT EXISTS "opening_balance_date" DATE;
ALTER TABLE "bank_accounts" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true;
ALTER TABLE "bank_accounts" ADD COLUMN IF NOT EXISTS "agency" TEXT;
ALTER TABLE "bank_accounts" ADD COLUMN IF NOT EXISTS "account_number" TEXT;
