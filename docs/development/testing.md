# 🧪 Testovací scénáře a QA checklist
Tento dokument obsahuje manuální testovací scénáře pro ověření funkčnosti aplikace.

## 🚀 Automatizované testy

### Unit & Integration testy

**První spuštění (automatický setup testovací databáze):**
```bash
# Backend testy (automaticky vytvoří testovací databázi)
npm run test --workspace=backend
```

**Běžné použití:**
```bash
# Backend testy (Jest + Supertest)
npm run test --workspace=backend

# Frontend testy (Vitest + React Testing Library)
npm run test --workspace=frontend

# Všechny testy najednou
npm run test --workspaces

# S coverage
npm run test:coverage --workspace=backend
npm run test:coverage --workspace=frontend

# Watch mode pro vývoj
npm run test:watch --workspace=backend
```

**Manuální setup testovací databáze (volitelné):**
```bash
npm run test:setup --workspace=backend
```

Více informací: [tests/unit/README.md](../tests/unit/README.md)

### Performance testy
```bash
# Backend API response time test
npm run test:api

# Frontend Lighthouse performance test
npm run test:lighthouse

# Oba testy najednou
npm run test:performance
```

Více informací: [tests/performance/README.md](../tests/performance/README.md)

### Security testy
```bash
# Bezpečnostní testy (SQL injection, XSS, JWT, atd.)
npm run test:security
```

Více informací: [tests/security/README.md](../tests/security/README.md)

---

## 📋 Testovací účty

Pro testování použijte tyto předdefinované účty (po spuštění `npm run seed`):

| Role | Email | Heslo |
|------|-------|-------|
| Admin | admin@example.com | admin123 |
| Organizátor | organizer@example.com | organizer123 |
| Uživatel | user@example.com | user123 |

---
## Manuální testování aplikace

### 1. Autentizace a registrace

#### Test: Registrace nového uživatele
**Kroky:**
1. Přejděte na `/register`
2. Vyplňte formulář:
   - Jméno: Jan
   - Příjmení: Novák
   - Email: jan.novak@test.com
   - Heslo: heslo123
   - Role: Běžný uživatel
3. Klikněte na "Zaregistrovat se"

**Očekávaný výsledek:**
- ✅ Uživatel je úspěšně zaregistrován
- ✅ Zobrazí se toast notifikace "Úspěšně zaregistrován!"
- ✅ Uživatel je automaticky přihlášen
- ✅ Přesměrování na homepage
- ✅ V navigation baru se zobrazí jméno uživatele

#### Test: Registrace s existujícím emailem
**Kroky:**
1. Zkuste se zaregistrovat s již použitým emailem

**Očekávaný výsledek:**
- ❌ Registrace selže
- ✅ Zobrazí se chyba "Uživatel s tímto emailem již existuje"

#### Test: Přihlášení
**Kroky:**
1. Přejděte na `/login`
2. Zadejte email a heslo
3. Klikněte na "Přihlásit se"

**Očekávaný výsledek:**
- ✅ Úspěšné přihlášení
- ✅ Přesměrování na homepage
- ✅ Navigation bar zobrazuje přihlášeného uživatele

#### Test: Neplatné přihlašovací údaje
**Kroky:**
1. Zadejte neexistující email nebo špatné heslo

**Očekávaný výsledek:**
- ❌ Přihlášení selže
- ✅ Zobrazí se chyba "Neplatné přihlašovací údaje"

#### Test: Odhlášení
**Kroky:**
1. Klikněte na "Odhlásit" v navigation baru

**Očekávaný výsledek:**
- ✅ Uživatel je odhlášen
- ✅ Token je smazán z localStorage
- ✅ Navigation bar zobrazuje "Přihlásit se" a "Registrace"

---

### 2. Prohlížení akcí

#### Test: Seznam všech akcí
**Kroky:**
1. Přejděte na `/events`

**Očekávaný výsledek:**
- ✅ Zobrazí se seznam publikovaných akcí
- ✅ Každá akce obsahuje: název, popis, datum, místo, cenu
- ✅ Zobrazí se počet dostupných vstupenek

#### Test: Vyhledávání akcí
**Kroky:**
1. V search baru zadejte "ples"
2. Počkejte na filtrování

**Očekávaný výsledek:**
- ✅ Zobrazí se pouze akce obsahující "ples" v názvu nebo popisu
- ✅ Vyhledávání je case-insensitive

#### Test: Filtrování podle kategorie
**Kroky:**
1. V selectu vyberte kategorii "Koncert"

**Očekávaný výsledek:**
- ✅ Zobrazí se pouze koncerty
- ✅ Seznam se aktualizuje okamžitě

#### Test: Detail akce (po implementaci)
**Kroky:**
1. Klikněte na libovolnou akci
2. Přejděte na detail (`/events/:id`)

**Očekávaný výsledek:**
- ✅ Zobrazí se kompletní informace o akci
- ✅ Viditelné: obrázek, popis, datum, místo, organizátor
- ✅ Formulář pro výběr počtu vstupenek

---

### 3. Správa akcí (Organizátor)

#### Test: Vytvoření akce
**Příprava:** Přihlaste se jako organizátor

**Kroky:**
1. Přejděte na `/events/create`
2. Vyplňte formulář:
   - Název: Testovací koncert
   - Popis: Lorem ipsum...
   - Místo: Brno
   - Datum zahájení: 2024-06-15 20:00
   - Datum ukončení: 2024-06-15 23:00
   - Kategorie: Koncert
   - Celkový počet vstupenek: 100
   - Cena: 200 Kč
   - Status: PUBLISHED
3. Odešlete formulář

**Očekávaný výsledek:**
- ✅ Akce je vytvořena v databázi
- ✅ Toast: "Akce byla úspěšně vytvořena"
- ✅ Přesměrování na `/my-events`
- ✅ Nová akce se zobrazí v seznamu

#### Test: Validace formuláře
**Kroky:**
1. Zkuste odeslat formulář s prázdným názvem
2. Zkuste odeslat s negativní cenou

**Očekávaný výsledek:**
- ❌ Formulář není odeslán
- ✅ Zobrazí se validační chyby u příslušných polí

#### Test: Úprava akce
**Kroky:**
1. V seznamu "Moje akce" klikněte na "Upravit"
2. Změňte název akce
3. Uložte změny

**Očekávaný výsledek:**
- ✅ Změny jsou uloženy
- ✅ Toast: "Akce byla úspěšně aktualizována"
- ✅ Nový název se zobrazí všude

#### Test: Zrušení akce
**Kroky:**
1. Klikněte na "Zrušit akci"
2. Potvrďte akci

**Očekávaný výsledek:**
- ✅ Status akce se změní na CANCELLED
- ✅ Akce zmizí z veřejného seznamu
- ✅ Všichni s rezervacemi dostanou email (po implementaci)

#### Test: Oprávnění
**Kroky:**
1. Jako běžný uživatel zkuste přejít na `/events/create`

**Očekávaný výsledek:**
- ❌ Přístup zamítnut
- ✅ Přesměrování na homepage

---

### 4. Rezervace vstupenek

#### Test: Vytvoření rezervace
**Kroky:**
1. Přejděte na detail akce
2. Vyberte počet vstupenek (např. 2)
3. Klikněte na "Rezervovat"

**Očekávaný výsledek:**
- ✅ Rezervace je vytvořena se statusem PENDING
- ✅ Generován unikátní rezervační kód (8 znaků)
- ✅ Celková cena je správně vypočítána (2 × cena vstupenky)
- ✅ Počet dostupných vstupenek se sníží o 2
- ✅ Toast: "Rezervace byla úspěšně vytvořena"
- ✅ Přesměrování na platbu

#### Test: Nedostatek vstupenek
**Kroky:**
1. Zkuste rezervovat více vstupenek než je dostupných

**Očekávaný výsledek:**
- ❌ Rezervace selže
- ✅ Chyba: "Nedostatek volných vstupenek. Dostupné: X"

#### Test: Seznam mých rezervací
**Kroky:**
1. Přejděte na `/reservations`

**Očekávaný výsledek:**
- ✅ Zobrazí se všechny rezervace aktuálního uživatele
- ✅ Barevné označení statusu:
  - 🟡 PENDING - žlutá
  - 🟢 CONFIRMED - zelená
  - 🔴 CANCELLED - červená
  - 🔵 REFUNDED - modrá

#### Test: Zrušení rezervace
**Kroky:**
1. U rezervace se statusem PENDING klikněte "Zrušit"
2. Potvrďte akci

**Očekávaný výsledek:**
- ✅ Status se změní na CANCELLED
- ✅ Vstupenky se vrátí zpět do poolu dostupných
- ✅ Pokud byla platba provedena, označí se k refundaci

#### Test: Úprava počtu vstupenek
**Kroky:**
1. U PENDING rezervace změňte počet vstupenek
2. Uložte změny

**Očekávaný výsledek:**
- ✅ Počet vstupenek se aktualizuje
- ✅ Celková cena se přepočítá
- ✅ Dostupnost v events se aktualizuje

---

### 5. Platby (Stripe)

#### Test: Vytvoření payment intentu
**Kroky:**
1. Po vytvoření rezervace pokračujte na platbu
2. API volání na `/payments/create-payment-intent`

**Očekávaný výsledek:**
- ✅ Backend vytvoří Payment Intent ve Stripe
- ✅ Vrátí client secret
- ✅ V DB se vytvoří payment record se statusem PENDING

#### Test: Úspěšná platba kartou
**Kroky:**
1. Použijte Stripe test kartu: `4242 4242 4242 4242`
2. Libovolné CVC a budoucí datum expirace
3. Odešlete platbu

**Očekávaný výsledek:**
- ✅ Platba je zpracována
- ✅ Webhook od Stripe aktualizuje status na COMPLETED
- ✅ Rezervace se změní na CONFIRMED
- ✅ Email potvrzení je odeslán (po implementaci)
- ✅ Přesměrování na potvrzovací stránku

#### Test: Selhání platby
**Kroky:**
1. Použijte Stripe test kartu: `4000 0000 0000 0002` (decline)

**Očekávaný výsledek:**
- ❌ Platba je zamítnuta
- ✅ Payment status: FAILED
- ✅ Rezervace zůstává PENDING
- ✅ Uživatel může zkusit zaplatit znovu

---

### 6. Reklamace

#### Test: Podání reklamace
**Kroky:**
1. Přejděte na detail rezervace se statusem CONFIRMED
2. Klikněte "Podat reklamaci"
3. Vyplňte formulář:
   - Důvod: Akce byla zrušena
   - Popis: Detailní vysvětlení...
4. Odešlete

**Očekávaný výsledek:**
- ✅ Reklamace je vytvořena se statusem SUBMITTED
- ✅ Toast: "Reklamace byla úspěšně podána"
- ✅ Zobrazí se v seznamu mých reklamací

#### Test: Seznam reklamací (Admin)
**Příprava:** Přihlaste se jako admin

**Kroky:**
1. Přejděte na `/admin/complaints`

**Očekávaný výsledek:**
- ✅ Zobrazí se všechny reklamace ze systému
- ✅ Možnost filtrovat podle statusu
- ✅ U každé reklamace jsou informace o uživateli a rezervaci

#### Test: Schválení reklamace s refundem
**Kroky:**
1. Otevřete detail reklamace
2. Změňte status na IN_REVIEW
3. Napište odpověď
4. Zaškrtněte "Vrátit peníze"
5. Klikněte "Vyřešit reklamaci"

**Očekávaný výsledek:**
- ✅ Status reklamace: RESOLVED
- ✅ Payment status: REFUNDED
- ✅ Reservation status: REFUNDED
- ✅ Vstupenky se vrátí zpět do events.availableTickets
- ✅ V reálném systému by se provedl Stripe refund

#### Test: Zamítnutí reklamace
**Kroky:**
1. Změňte status na REJECTED
2. Napište důvod zamítnutí

**Očekávaný výsledek:**
- ✅ Status: REJECTED
- ✅ Uživatel vidí odpověď admina
- ✅ Rezervace a platba zůstávají beze změny

---

### 7. Admin funkce

#### Test: Správa všech uživatelů
**Kroky:**
1. Jako admin přejděte na `/api/users`

**Očekávaný výsledek:**
- ✅ Zobrazí se seznam všech uživatelů
- ✅ Možnost deaktivovat účet

#### Test: Správa všech akcí
**Kroky:**
1. Admin může upravit nebo zrušit jakoukoli akci

**Očekávaný výsledek:**
- ✅ Admin má přístup k akcím všech organizátorů
- ✅ Může měnit status jakékoli akce

---

## Performance testy

### Test: Načítání stránky s akcemi
**Metriky:**
- ⏱️ First Contentful Paint: < 1.5s
- ⏱️ Time to Interactive: < 3.5s
- ⏱️ Lighthouse Performance Score: > 90

### Test: API response time
- ⏱️ GET /events: < 200ms
- ⏱️ POST /reservations: < 300ms
- ⏱️ POST /payments/create-payment-intent: < 500ms

### Test: Databázové queries
```bash
# Spusťte Prisma Studio a sledujte query performance
npx prisma studio
```

---

## Bezpečnostní testy

### Test: SQL Injection
**Kroky:**
1. V search poli zadejte: `' OR 1=1 --`

**Očekávaný výsledek:**
- ✅ Prisma ORM automaticky escapuje vstupy
- ✅ Žádná SQL injection není možná

### Test: XSS (Cross-Site Scripting)
**Kroky:**
1. V názvu akce zkuste: `<script>alert('XSS')</script>`

**Očekávaný výsledek:**
- ✅ React automaticky escapuje JSX
- ✅ Script se nezpustí, zobrazí se jako text

### Test: JWT token manipulace
**Kroky:**
1. V Developer Tools → Application → localStorage
2. Zkuste upravit token

**Očekávaný výsledek:**
- ❌ Upravený token je neplatný
- ✅ Backend vrátí 401 Unauthorized

### Test: CSRF protection
**Kroky:**
1. Zkuste poslat POST request z jiné domény

**Očekávaný výsledek:**
- ❌ CORS policy blokuje request
- ✅ Pouze povolené origins mohou volat API

---

## Automatizované testy (doporučení)

### Backend unit testy

```bash
npm install --save-dev jest @types/jest ts-jest supertest
```

```typescript
// backend/src/__tests__/auth.test.ts
import request from 'supertest';
import app from '../index';

describe('Auth endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password123',
      });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
```

### Frontend component testy

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

```typescript
// frontend/src/components/__tests__/EventCard.test.tsx
import { render, screen } from '@testing-library/react';
import EventCard from '../EventCard';

const mockEvent = {
  id: '1',
  title: 'Test Event',
  // ... další props
};

test('renders event title', () => {
  render(<EventCard event={mockEvent} />);
  expect(screen.getByText('Test Event')).toBeInTheDocument();
});
```

---

## Checklist před nasazením do produkce

- [ ] Všechny testy proběhly úspěšně
- [ ] Environment variables jsou správně nastaveny
- [ ] SSL certifikát je aktivní
- [ ] Database backup je nastaven
- [ ] Error logging je funkční (Sentry)
- [ ] Rate limiting je aktivní
- [ ] CORS je správně nakonfigurován
- [ ] Stripe webhook je nastaven na produkční URL
- [ ] SMTP server pro emaily funguje
- [ ] Dokumentace je aktuální
- [ ] README obsahuje deployment instrukce

---

**Poznámka:** Tento dokument by měl být průběžně aktualizován s novými testy při přidávání funkcí.
