-- Migrar enum CategoryFlowType de ('in','out') para ('income','expense','transfer')
-- e adicionar unique (company_id, name)

-- 1) Remover default e renomear coluna antiga
ALTER TABLE "categories" ALTER COLUMN "flow_type" DROP DEFAULT;
ALTER TABLE "categories" RENAME COLUMN "flow_type" TO "flow_type_old";

-- 2) Criar novo tipo enum
CREATE TYPE "CategoryFlowType_new" AS ENUM ('income', 'expense', 'transfer');

-- 3) Adicionar coluna com novo tipo (default 'expense')
ALTER TABLE "categories" ADD COLUMN "flow_type" "CategoryFlowType_new" NOT NULL DEFAULT 'expense';

-- 4) Migrar dados: in -> expense, out -> income
UPDATE "categories" SET "flow_type" = CASE "flow_type_old"::text
  WHEN 'in' THEN 'expense'::"CategoryFlowType_new"
  WHEN 'out' THEN 'income'::"CategoryFlowType_new"
  ELSE 'expense'::"CategoryFlowType_new"
END;

-- 5) Remover coluna e tipo antigos
ALTER TABLE "categories" DROP COLUMN "flow_type_old";
DROP TYPE "CategoryFlowType";

-- 6) Renomear tipo novo para o nome esperado pelo Prisma
ALTER TYPE "CategoryFlowType_new" RENAME TO "CategoryFlowType";

-- 7) Garantir default para novos registros
ALTER TABLE "categories" ALTER COLUMN "flow_type" SET DEFAULT 'expense'::"CategoryFlowType";

-- 8) Unique por empresa + nome (evita duplicar categorias no seed)
CREATE UNIQUE INDEX "categories_company_name_unique" ON "categories"("company_id", "name");
