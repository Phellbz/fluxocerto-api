-- CreateTable: budgets
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,

    "budget_number" TEXT,
    "status" TEXT,
    "stage" TEXT,

    "client_id" TEXT,
    "client_name" TEXT,
    "client_full_name" TEXT,
    "client_document" TEXT,
    "client_tags" TEXT,
    "contact_name" TEXT,

    "total_services" DECIMAL(14,2),
    "total_materials" DECIMAL(14,2),
    "total_amount" DECIMAL(14,2),

    "installment_count" INTEGER,
    "payment_method_label" TEXT,

    "bank_account_id" TEXT,
    "bank_account_name" TEXT,

    "category_id" TEXT,
    "category_name" TEXT,

    "department_id" TEXT,

    "advance_payment_status" TEXT,

    "expected_billing_date" DATE,
    "billed_at" TIMESTAMP(3),
    "billed_by" TEXT,

    "rps_date" DATE,

    "client_order_number" TEXT,
    "seller_name" TEXT,
    "project_name" TEXT,
    "contract_number" TEXT,
    "construction_code" TEXT,
    "art_code" TEXT,
    "product_remittance" TEXT,
    "observations" TEXT,

    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceled_at" TIMESTAMP(3),
    "created_by" TEXT,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable: budget_items
CREATE TABLE "budget_items" (
    "id" TEXT NOT NULL,
    "budget_id" TEXT,
    "item_type" TEXT,
    "product_id" TEXT,
    "description" TEXT,
    "detailed_description" TEXT,

    "quantity" DECIMAL(14,2),
    "unit_price" DECIMAL(14,2),
    "discount_percent" DECIMAL(14,2),
    "line_total" DECIMAL(14,2),

    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "budgets_company_idx" ON "budgets"("company_id");

-- CreateIndex
CREATE INDEX "budgets_number_idx" ON "budgets"("budget_number");

-- CreateIndex
CREATE INDEX "budget_items_budget_idx" ON "budget_items"("budget_id");

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
