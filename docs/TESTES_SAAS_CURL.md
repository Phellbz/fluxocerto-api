# Testes manuais – FluxoCerto SaaS (curl)

Substitua `BASE_URL` (ex: `https://seu-app.railway.app`) e `SYSTEM_SECRET` pelo valor de `SYSTEM_ADMIN_BOOTSTRAP_SECRET`.

---

## 1) Bootstrap do System Admin

```bash
curl -X POST "$BASE_URL/system/bootstrap" \
  -H "Content-Type: application/json" \
  -H "X-System-Bootstrap-Secret: $SYSTEM_SECRET" \
  -d '{"email":"admin@local","name":"System Admin","password":"123456"}'
```

Resposta esperada: `{"ok":true,"userId":"..."}`

---

## 2) Login como System Admin

```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@local","password":"123456"}'
```

Guarde o `accessToken` do JSON para os próximos passos.

---

## 3) System Admin: criar empresa + owner (senha temporária)

```bash
curl -X POST "$BASE_URL/system/companies" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "company":{"name":"Empresa X","document":"123"},
    "owner":{"name":"Fulano","email":"fulano@x.com"},
    "tempPassword":"TempPass123"
  }'
```

Resposta: `companyId`, `ownerUserId` e opcionalmente `tempPassword` (se o usuário foi criado agora).

---

## 4) Login como owner (senha temporária)

```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"fulano@x.com","password":"TempPass123"}'
```

Guarde o `accessToken` e o `companyId` (da empresa criada no passo 3).

---

## 5) Primeiro acesso: owner troca senha

```bash
curl -X POST "$BASE_URL/auth/first-access" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"fulano@x.com",
    "tempPassword":"TempPass123",
    "newPassword":"MinhaSenhaNova123"
  }'
```

Resposta: `{"ok":true}`

---

## 6) GET /me/companies

**Como System Admin** (retorna todas as empresas, ativas e inativas):

```bash
curl -s "$BASE_URL/me/companies" \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN"
```

**Como owner** (retorna apenas empresas onde é membro ativo e company ativa):

```bash
curl -s "$BASE_URL/me/companies" \
  -H "Authorization: Bearer $OWNER_ACCESS_TOKEN"
```

---

## 7) Owner criando usuário financeiro na empresa

```bash
curl -X POST "$BASE_URL/companies/$COMPANY_ID/members" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_ACCESS_TOKEN" \
  -H "X-Company-Id: $COMPANY_ID" \
  -d '{
    "name":"Ciclano",
    "email":"ciclano@x.com",
    "role":"financeiro",
    "tempPassword":"Temp456"
  }'
```

Listar membros:

```bash
curl -s "$BASE_URL/companies/$COMPANY_ID/members" \
  -H "Authorization: Bearer $OWNER_ACCESS_TOKEN" \
  -H "X-Company-Id: $COMPANY_ID"
```

---

## Variáveis de ambiente

- `SYSTEM_ADMIN_BOOTSTRAP_SECRET`: obrigatório para `POST /system/bootstrap`
- `JWT_SECRET`: usado para assinar o access token
