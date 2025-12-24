# Rezervační systém pro studentské akce
## Bakalářská práce - Webová aplikace pro rezervaci vstupenek

> 🎓 **Autor:** Tuan Anh Nguyen  
> 📅 **Akademický rok:** 2024/2025  
> 🏫 **Univerzita Palackého v Olomouci**

---

## 📄 Dokumentace

- **📘 Bakalářská práce:** [`kidiplom/kidiplom.pdf`](kidiplom/kidiplom.pdf) (25 stran)
- **👤 Uživatelská příručka:** [`docs/prirucka-uzivatelska.md`](docs/prirucka-uzivatelska.md)
- **💻 Programátorská příručka:** [`docs/prirucka-programatorska.md`](docs/prirucka-programatorska.md)

---

## 📝 O projektu

Webová aplikace slouží jako systém pro rezervaci vstupenek na studentské akce. Umožňuje organizátorům vytvářet a spravovat akce, uživatelům rezervovat a platit vstupenky pomocí Stripe platební brány.

### 🎯 Klíčové funkce

#### Pro uživatele
- ✅ Prohlížení akcí s filtrováním podle kategorií
- ✅ Rezervace vstupenek (až 10 ks)
- ✅ Platba kartou přes Stripe Payment Intent
- ✅ PDF vstupenky s QR kódem
- ✅ Správa rezervací (zrušení, úprava, refundace)
- ✅ Systém reklamací

#### Pro organizátory
- ✅ Vytváření a správa vlastních akcí
- ✅ Statistiky prodeje vstupenek a příjmů
- ✅ Správa rezervací na akce
- ✅ Emailové notifikace o nových rezervacích

#### Pro administrátory
- ✅ Správa všech uživatelů a akcí
- ✅ Řešení reklamací s automatickou refundací
- ✅ Celkové statistiky systému
- ✅ Dashboard s přehledy

### 👥 Uživatelské role

1. **USER** - běžný uživatel (rezervace vstupenek)
2. **ORGANIZER** - organizátor (správa vlastních akcí)
3. **ADMIN** - administrátor (plný přístup)

---

## 🛠️ Technologie

### Frontend
- **React 18.2** + TypeScript
- **Vite** - build tool
- **Zustand** - state management
- **Axios** - HTTP klient
- **Stripe Elements** - platební formuláře
- **Tailwind CSS** - styling

### Backend
- **Node.js** + **Express.js** + TypeScript
- **Prisma ORM 5.22** - database toolkit
- **PostgreSQL 14+** - relační databáze
- **Stripe API** - platební brána
- **JWT** - autentizace
- **Nodemailer** - emailové notifikace
- **PDFKit** - generování PDF vstupenek

### Testování
- **Vitest** - unit testy (frontend)
- **Jest** - unit testy (backend)
- **Playwright** - E2E testy
- **Pokrytí:** 147 testů, 10 test suites

---

## 🚀 Rychlé spuštění

### Prerekvizity
- Node.js 18+ a npm
- PostgreSQL 14+
- Stripe účet (testovací klíče)
- Gmail účet (pro SMTP)

### 1. Instalace závislostí

```bash
# Root
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Konfigurace

**Backend** - vytvoř `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ticket_reservation?schema=public"
JWT_SECRET="your-secret-key-min-32-chars"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
FRONTEND_URL="http://localhost:5173"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="Rezervační systém <your-email@gmail.com>"
```

**Frontend** - vytvoř `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### 3. Databáze

```bash
cd backend
npx prisma migrate dev      # Aplikuje migrace
npx prisma db seed          # Naplní testovacími daty
```

### 4. Spuštění

```bash
# V root složce
npm run dev
```

Aplikace běží na:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### 5. Testovací účty

Po seedování máš tyto účty:

| Role | Email | Heslo |
|------|-------|-------|
| Admin | admin@example.com | admin123 |
| Organizátor | organizer@example.com | organizer123 |
| Uživatel | user@example.com | user123 |

---

## 🧪 Testování

```bash
# Backend unit testy
npm run test:backend

# Frontend unit testy
npm run test:frontend

# E2E testy (Playwright)
npm run test:e2e

# Pokrytí
npm run test:coverage
```

---

## 📊 Databázový model

Aplikace používá **5 hlavních entit**:

1. **User** - uživatelé systému
2. **Event** - akce/události
3. **Reservation** - rezervace vstupenek
4. **Payment** - platby (Stripe)
5. **Complaint** - reklamace

**Stavy rezervace:**
- `PENDING` - čeká na platbu (placené akce)
- `CONFIRMED` - potvrzeno (akce zdarma)
- `PAID` - zaplaceno (po úspěšné Stripe platbě)
- `CANCELLED` - zrušeno
- `REFUNDED` - vráceno (po refundaci)

**Viz diagramy:** `kidiplom/database-model.png`, `kidiplom/reservation-states.png`

---

## 📁 Struktura projektu

```
bakalarka/
├── backend/                 # Node.js + Express API
│   ├── prisma/             # Databázové schéma a migrace
│   ├── src/
│   │   ├── controllers/    # HTTP endpointy
│   │   ├── services/       # Byznys logika
│   │   ├── routes/         # API routy
│   │   ├── middleware/     # Auth, validace
│   │   └── utils/          # Pomocné funkce
│   └── __tests__/          # Backend testy
│
├── frontend/                # React aplikace
│   ├── src/
│   │   ├── components/     # React komponenty
│   │   ├── pages/          # Stránky/views
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # Zustand store
│   │   └── utils/          # Utility funkce
│   └── __tests__/          # Frontend testy
│
├── kidiplom/                # LaTeX bakalářská práce
│   ├── kidiplom.pdf        # ✅ Finální PDF
│   ├── kidiplom.tex        # Zdrojový soubor
│   ├── *.puml              # PlantUML diagramy
│   └── graphics/           # Obrázky a diagramy
│
├── docs/                    # Dokumentace
│   ├── prirucka-uzivatelska.md
│   └── prirucka-programatorska.md
│
├── tests/                   # E2E Playwright testy
├── docker-compose.yml       # PostgreSQL + pgAdmin
└── README.md               # Tento soubor
```

---

## 🔐 Bezpečnost

- ✅ JWT autentizace s expirací 7 dní
- ✅ Bcrypt hashování hesel (10 rounds)
- ✅ Role-based access control (RBAC)
- ✅ Stripe webhook signature validation
- ✅ Input validace (Zod schémata)
- ✅ SQL injection prevence (Prisma ORM)
- ✅ CORS konfigurace

---

## 📧 Email notifikace

Systém odesílá emaily při:
- ✉️ Registraci nového účtu
- 💳 Úspěšné platbě
- 🎫 Potvrzení rezervace (akce zdarma)
- ❌ Zrušení rezervace/refundaci
- 🎪 Změně stavu akce (organizátor)
- 💬 Vyřízení reklamace

---

## 🎨 Design

- **Responzivní design** (mobile-first)
- **Tailwind CSS** utility classes
- **Komponenty:** Karty, formuláře, modály, filtry, statistiky
- **Konzistentní barevná paleta** (modro-fialové gradients)
- **Accessibility** (ARIA labels, keyboard navigation)

---

## 📈 Klíčové metriky

- **Backend pokrytí:** 147 testů ✅
- **Frontend komponenty:** 50+ React komponent
- **API endpointy:** 40+ REST endpoints
- **Databázové migrace:** 4 migrace
- **Řádky kódu:** ~15,000 LOC
- **Velikost bakalářky:** 25 stran, 5 diagramů

---

## 🐛 Známé limitace

- Stripe funguje pouze v test mode (CZ karty nejsou plně podporovány)
- Email SMTP vyžaduje Gmail App Password
- QR kód ve vstupenkách není validován (pouze demo)
- Bez cache mechanismu (Redis)
- Bez rate limitingu na API

---

## 📖 Další informace

Pro detailní informace o:
- **Použití aplikace:** Viz [`docs/prirucka-uzivatelska.md`](docs/prirucka-uzivatelska.md)
- **Vývoji a architektuře:** Viz [`docs/prirucka-programatorska.md`](docs/prirucka-programatorska.md)
- **Teoretických základech:** Viz [`kidiplom/kidiplom.pdf`](kidiplom/kidiplom.pdf)

---

## 📞 Kontakt

Pro otázky k projektu kontaktujte autora na GitHub: [perlesjagerin/bakalarka](https://github.com/perlesjagerin/bakalarka)

---

**Vytvořeno jako bakalářská práce na Univerzitě Palackého v Olomouci, 2024/2025**
