-- CreateTable: products
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,

    "codigo_integracao" TEXT,
    "codigo_produto" TEXT,
    "descricao" TEXT,
    "ncm" TEXT,
    "unidade" TEXT,
    "familia" TEXT,
    "marca" TEXT,
    "modelo" TEXT,
    "tipo" TEXT,
    "local_estoque" TEXT,

    "estoque_minimo" DECIMAL(14,2),
    "estoque_atual" DECIMAL(14,2),
    "estoque_inicial" DECIMAL(14,2),

    "preco_custo" DECIMAL(14,2),
    "preco_venda" DECIMAL(14,2),

    "peso_liquido" DECIMAL(14,2),
    "peso_bruto" DECIMAL(14,2),

    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_company_idx" ON "products"("company_id");

-- CreateIndex
CREATE INDEX "products_codigo_idx" ON "products"("codigo_produto");
