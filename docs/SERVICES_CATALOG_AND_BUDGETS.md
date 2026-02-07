# Catálogo de Serviços e Integração com Orçamentos

## 1) Arquivos criados

- `prisma/migrations/20260206120000_add_services_and_budget_items_services/migration.sql` – tabela `services` + enum `product` + campos em `budget_items`
- `src/services-catalog/dto/create-service.dto.ts`
- `src/services-catalog/dto/update-service.dto.ts`
- `src/services-catalog/dto/list-services-query.dto.ts`
- `src/services-catalog/services-catalog.service.ts`
- `src/services-catalog/services-catalog.controller.ts`
- `src/services-catalog/services-catalog.module.ts`
- `docs/SERVICES_CATALOG_AND_BUDGETS.md` (este arquivo)

## 2) Arquivos alterados

- `prisma/schema.prisma` – model `Service`, `Company.services`, enum `BudgetItemType` (+ product), `BudgetItem` (+ serviceId, descriptionSnapshot, unitPriceCentsSnapshot, taxSnapshot, totalCents, relation Service)
- `src/app.module.ts` – import e registro de `ServicesCatalogModule`
- `src/budgets/dto/budget-item-input.dto.ts` – `serviceId`, `unitPriceCents`, `itemType` PRODUCT/SERVICE/material
- `src/budgets/budgets.service.ts` – `toBudgetItemType` (product/service/material), `buildItemRows` assíncrono com suporte a SERVICE (snapshots + taxSnapshot) e PRODUCT (snapshots)

## 3) Rotas disponíveis

Todas as rotas de serviços exigem **JWT** e **X-Company-Id** (CompanyGuard).

### Catálogo de serviços

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /services | Lista com query, isActive, take, skip |
| GET | /services/:id | Um serviço por id |
| POST | /services | Cria serviço |
| PATCH | /services/:id | Atualiza serviço |
| DELETE | /services/:id | Soft delete (isActive=false) |

**GET /services** – Query params:
- `query` (string, opcional) – busca em serviceCode, shortDescription, fullDescription (case insensitive)
- `isActive` (`"true"` \| `"false"`, padrão true)
- `take` (1–200, padrão 50)
- `skip` (padrão 0)

Resposta: `{ items: Service[], total: number }`.

**POST /services** – Body (exemplo):
```json
{
  "serviceCode": "1.01",
  "shortDescription": "Consultoria",
  "serviceTaxation": "tributado",
  "integrationCode": "EXT-001",
  "municipalServiceCode": "1.01",
  "unitPriceCents": 10000,
  "fullDescription": "Descrição longa",
  "issRate": 5,
  "withholdIss": false,
  "pisRate": 0.65,
  "withholdPis": false,
  "cofinsRate": 3,
  "withholdCofins": false,
  "isActive": true
}
```

**PATCH /services/:id** – mesmos campos do create, todos opcionais.

### Orçamentos (comportamento existente + SERVICE)

- **POST /budgets** e **PATCH /budgets/:id** aceitam `items` com:
  - **itemType**: `"SERVICE"` ou `"PRODUCT"` ou `"material"` (legado)
  - **serviceId** (obrigatório se itemType = SERVICE)
  - **productId** (obrigatório se itemType = PRODUCT/material)
  - **quantity**, **unitPriceCents** (opcional; para SERVICE sobrescreve preço do catálogo)
  - **description**, **unitPrice**, **lineTotal**, **discountPercent** (compatibilidade)

Exemplo de item SERVICE no orçamento:
```json
{
  "itemType": "SERVICE",
  "serviceId": "<uuid-do-serviço>",
  "quantity": 1,
  "unitPriceCents": 5000
}
```

Exemplo de item PRODUCT (compatível com o que já existia):
```json
{
  "itemType": "PRODUCT",
  "productId": "<uuid-do-produto>",
  "quantity": 2,
  "description": "Produto X"
}
```

**GET /budgets** e **GET /budgets/:id** – itens retornados com:
- `itemType`, `productId`, `serviceId`
- `descriptionSnapshot`, `unitPriceCentsSnapshot`, `taxSnapshot` (para serviços)

## 4) Compatibilidade

- **Produtos/materiais**: fluxo atual mantido; `itemType` pode ser `material` ou `product`; `productId` continua sendo usado; snapshots passam a ser preenchidos também para itens PRODUCT.
- **Budgets**: `items` sem `itemType` continuam tratados como antes (material/service antigo); para novo fluxo use `itemType: "SERVICE"` com `serviceId` e `itemType: "PRODUCT"` com `productId`.
- **Unique**: `(companyId, serviceCode)` em `services`; 409 em conflito.

## 5) Testes manuais (curl)

Substitua `BASE`, `TOKEN` e `COMPANY_ID`.

```bash
# 1) Criar serviço
curl -s -X POST "$BASE/services" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Company-Id: $COMPANY_ID" \
  -H "Content-Type: application/json" \
  -d '{"serviceCode":"SVC01","shortDescription":"Consultoria","serviceTaxation":"tributado","unitPriceCents":10000}'

# 2) Listar serviços
curl -s "$BASE/services?query=consult&take=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Company-Id: $COMPANY_ID"

# 3) Soft delete
curl -s -X DELETE "$BASE/services/<SERVICE_ID>" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Company-Id: $COMPANY_ID"

# 4) Criar orçamento com item SERVICE e item PRODUCT
curl -s -X POST "$BASE/budgets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Company-Id: $COMPANY_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "budgetNumber":"ORC-001",
    "items":[
      {"itemType":"SERVICE","serviceId":"<SERVICE_UUID>","quantity":1,"unitPriceCents":5000},
      {"itemType":"PRODUCT","productId":"<PRODUCT_UUID>","quantity":2}
    ]
  }'

# 5) Buscar orçamento (itens com itemType e snapshots)
curl -s "$BASE/budgets/<BUDGET_ID>" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Company-Id: $COMPANY_ID"
```

## 6) Deploy

```bash
npx prisma migrate deploy
npx prisma generate
npm run build
git add .
git commit -m "Services catalog + budget items support service"
git push
railway up
```
