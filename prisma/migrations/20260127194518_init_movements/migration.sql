-- CreateTable
CREATE TABLE "Movement" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "direction" TEXT NOT NULL,
    "categoryId" TEXT,
    "bankAccountId" TEXT,
    "contactId" TEXT,
    "departmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Movement_companyId_occurredAt_idx" ON "Movement"("companyId", "occurredAt");
