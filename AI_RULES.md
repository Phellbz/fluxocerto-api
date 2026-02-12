# FluxoCerto Backend — regras do agente

Stack: NestJS + Prisma + Postgres. Deploy: Railway.

Regras obrigatórias:
- Multi-tenant: TODA query deve filtrar por companyId.
- companyId vem do JWT (req.user.companyId). Nunca aceitar companyId do body/query.
- Validar inputs (DTO + class-validator).
- Controller fino, regra no Service.
- PrismaService é a única forma de acessar DB.
- Se receber IDs relacionados (categoryId/bankAccountId/contactId/departmentId), validar que existem e pertencem à mesma company.
- Usar migrations Prisma quando alterar schema.
- Tratar erros com BadRequest/Forbidden/NotFound.
- Ao final, listar arquivos alterados e como testar (comandos).
