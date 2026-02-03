-- Etapa 01: base estrutural multi-empresa (NÃO altera autenticação)
-- Extensão para gen_random_uuid() (PG menor que 13; em PG 13+ é built-in)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "CompanyRole" AS ENUM ('master', 'admin', 'financeiro', 'estoque', 'member');

-- CreateTable: app_users
CREATE TABLE "app_users" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid()::text),
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "avatar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "app_users_email_key" ON "app_users"("email");

-- CreateTable: companies
CREATE TABLE "companies" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid()::text),
    "name" TEXT NOT NULL,
    "document" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable: company_members
CREATE TABLE "company_members" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid()::text),
    "company_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "CompanyRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_members_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "company_members_company_user_unique" ON "company_members"("company_id", "user_id");
CREATE INDEX "company_members_company_idx" ON "company_members"("company_id");
CREATE INDEX "company_members_user_idx" ON "company_members"("user_id");

-- CreateTable: company_config
CREATE TABLE "company_config" (
    "company_id" TEXT NOT NULL,
    "razao_social" TEXT,
    "nome_fantasia" TEXT,
    "cnpj" TEXT,
    "inscricao_estadual" TEXT,
    "inscricao_municipal" TEXT,
    "regime_tributario" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "cep" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "nome_contato" TEXT,
    "logo_url" TEXT,

    CONSTRAINT "company_config_pkey" PRIMARY KEY ("company_id")
);

-- AddForeignKey: company_members -> companies
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: company_members -> app_users
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: company_config -> companies
ALTER TABLE "company_config" ADD CONSTRAINT "company_config_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
