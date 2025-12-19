# Security Tests

Automatizované bezpečnostní testy pro ověření, že aplikace je chráněna proti běžným útokům.

## 🔒 Co testujeme

### 1. SQL Injection
- ✅ Ochrana proti SQL injection v login formuláři
- ✅ Ochrana proti SQL injection v search queries
- ✅ Prisma ORM automaticky escapuje vstupy

### 2. XSS (Cross-Site Scripting)
- ✅ XSS payloady jsou uloženy jako plain text
- ✅ React automaticky escapuje JSX výstupy
- ✅ Nelze spustit JavaScript kód v uživatelských vstupech

### 3. JWT Token Security
- ✅ Chráněné endpointy vyžadují token
- ✅ Neplatné tokeny jsou zamítnuty
- ✅ Manipulované tokeny jsou detekovány
- ✅ Signature verification funguje

### 4. Authorization
- ✅ Role-based access control (USER, ORGANIZER, ADMIN)
- ✅ Uživatelé nemohou přistupovat k cizím zdrojům
- ✅ Admin endpointy jsou chráněné

### 5. Rate Limiting
- ✅ Detekce rate limitingu (pokud je nakonfigurován)
- ✅ Ochrana proti brute-force útokům

### 6. CORS Protection
- ✅ CORS headers jsou správně nastaveny
- ✅ Pouze povolené origins mohou volat API

---

## 🚀 Spuštění testů

```bash
# Základní test
npm run test:security

# Nebo přímo
node tests/security/security-test.js
```

**Požadavky:**
- Backend musí běžet na http://localhost:3001
- Databáze musí být dostupná
- Registrace musí být funkční

---

## 📊 Výstup

Testy vypíší barevný výstup:
- 🟢 **PASS** - Test prošel, bezpečnost OK
- 🔴 **FAIL** - Test selhal, bezpečnostní problém!
- 🟡 **WARN** - Varování, doporučeno zkontrolovat

### Příklad výstupu:

```
═══════════════════════════════════════
   🔒 Security Tests
═══════════════════════════════════════

═══════════════════════════════════════
   1. SQL Injection Tests
═══════════════════════════════════════

✅ PASS - SQL Injection in login email: "' OR '1'='1"
   Prisma ORM correctly escaped the input

✅ PASS - SQL Injection in search query
   Query parameter safely handled by Prisma

═══════════════════════════════════════
   2. XSS Protection Tests
═══════════════════════════════════════

✅ PASS - XSS payload stored as text: "<script>alert('XSS')</script>"
   XSS payload stored safely as plain text

═══════════════════════════════════════
   Summary
═══════════════════════════════════════

Total tests: 20
Passed: 20
Failed: 0

Success rate: 100.0%

✅ All security tests passed!
Your application has good security practices.
```

---

## 🛡️ Bezpečnostní best practices

### JWT Tokens
- ✅ Používáme silný secret key
- ✅ Expirační doba: 7 dní
- ✅ Signature verification při každém requestu
- ✅ Tokeny jsou uloženy v localStorage (ne v cookies kvůli XSS)

### Databáze
- ✅ Prisma ORM automaticky escapuje SQL queries
- ✅ Prepared statements pro všechny dotazy
- ✅ Žádné raw SQL queries bez sanitizace

### Input Validation
- ✅ Zod schema validace na backend
- ✅ React Hook Form validace na frontend
- ✅ Email formát validace
- ✅ Délka a typ vstupů kontrolovány

### Password Security
- ✅ Bcrypt hashing (10 salt rounds)
- ✅ Hesla nikdy neuložena v plain textu
- ✅ Minimální délka hesla: 6 znaků

### HTTPS (pro production)
- ⚠️ Použijte HTTPS v produkci
- ⚠️ SSL/TLS certifikát (Let's Encrypt)
- ⚠️ HSTS header

### Environment Variables
- ✅ Citlivé údaje v .env
- ✅ .env je v .gitignore
- ✅ Různé .env pro dev/prod

---

## 🔧 Konfigurace bezpečnosti

### Rate Limiting (doporučeno přidat)

```typescript
// backend/src/middleware/rateLimit.middleware.ts
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 5, // max 5 pokusů
  message: 'Příliš mnoho pokusů o přihlášení, zkuste to později',
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // max 100 requestů za 15 min
});
```

### Helmet (Security Headers)

```bash
npm install helmet
```

```typescript
// backend/src/index.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### CORS Konfigurace

```typescript
// backend/src/config/cors.ts
import cors from 'cors';

export const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};
```

---

## 📋 Security Checklist

- [x] SQL Injection ochrana (Prisma ORM)
- [x] XSS ochrana (React auto-escape)
- [x] JWT authentication
- [x] Role-based authorization
- [x] Password hashing (bcrypt)
- [x] Input validation (Zod)
- [ ] Rate limiting (doporučeno implementovat)
- [ ] Helmet security headers (doporučeno)
- [x] CORS konfigurace
- [ ] HTTPS v produkci
- [ ] Security monitoring (Sentry)
- [ ] Regular security audits

---

## 🚨 Co dělat při security incidentu

1. **Immediate Response:**
   - Pozastavte postižené služby
   - Změňte všechny přístupové klíče
   - Invalidujte všechny JWT tokeny

2. **Investigation:**
   - Zkontrolujte logy
   - Identifikujte rozsah útoku
   - Dokumentujte incident

3. **Recovery:**
   - Opravte zranitelnost
   - Obnovte ze zálohy pokud nutné
   - Notifikujte uživatele pokud nutné

4. **Prevention:**
   - Implementujte dodatečné security measures
   - Spusťte security audit
   - Update dokumentace

---

## 📚 Další zdroje

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Prisma Security](https://www.prisma.io/docs/guides/security)
