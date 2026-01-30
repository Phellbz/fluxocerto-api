-- Backfill: corrigir registros antigos com NULL
UPDATE bank_accounts SET account_type = '' WHERE account_type IS NULL;
UPDATE bank_accounts SET is_active = true WHERE is_active IS NULL;
UPDATE bank_accounts SET institution = '' WHERE institution IS NULL;
UPDATE bank_accounts SET agency = '' WHERE agency IS NULL;
UPDATE bank_accounts SET account_number = '' WHERE account_number IS NULL;

-- Defaults para novas linhas
ALTER TABLE bank_accounts ALTER COLUMN account_type SET DEFAULT '';
ALTER TABLE bank_accounts ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE bank_accounts ALTER COLUMN institution SET DEFAULT '';
ALTER TABLE bank_accounts ALTER COLUMN agency SET DEFAULT '';
ALTER TABLE bank_accounts ALTER COLUMN account_number SET DEFAULT '';

-- NOT NULL (opening_balance e opening_balance_date continuam NULL quando não informado)
ALTER TABLE bank_accounts ALTER COLUMN account_type SET NOT NULL;
ALTER TABLE bank_accounts ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE bank_accounts ALTER COLUMN institution SET NOT NULL;
ALTER TABLE bank_accounts ALTER COLUMN agency SET NOT NULL;
ALTER TABLE bank_accounts ALTER COLUMN account_number SET NOT NULL;
