# 🎓 Návod k instalaci a spuštění

## Prerekvizity

Před instalací se ujistěte, že máte nainstalováno:
- **Node.js** verze 18 nebo vyšší ([stáhnout zde](https://nodejs.org/))
- **PostgreSQL** verze 14 nebo vyšší ([stáhnout zde](https://www.postgresql.org/download/))
- **npm** nebo **yarn** package manager
- Git

## 1. Klonování projektu

```bash
git clone <repository-url>
cd bakalarka
```

## 2. Nastavení databáze

### Vytvoření databáze v PostgreSQL

```bash
# Přihlaste se do PostgreSQL
psql -U postgres

# Vytvořte databázi
CREATE DATABASE ticket_reservation;

# Vytvořte uživatele (volitelné)
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE ticket_reservation TO myuser;

# Ukončete psql
\q
```

## 3. Backend setup

### Instalace závislostí

```bash
cd backend
npm install
```

### Konfigurace environment variables

Vytvořte soubor `.env` v `backend/` složce:

```env
# Database
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/ticket_reservation?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"

# Stripe (pro testování použijte test keys)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@ticketapp.com"

# Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR="./uploads"

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Poznámky:**
- Změňte `DATABASE_URL` podle vašeho PostgreSQL nastavení
- Pro Stripe klíče se zaregistrujte na [stripe.com](https://stripe.com) a použijte test klíče
- Pro Gmail SMTP, vytvořte "App Password" v Google Account settings

### Spuštění databázových migrací

```bash
npx prisma generate
npx prisma migrate dev
```

### (Volitelné) Vložení testovacích dat

Vytvořte soubor `backend/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  // Organizátor
  const organizerPassword = await bcrypt.hash('organizer123', 10);
  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@example.com',
      password: organizerPassword,
      firstName: 'Marie',
      lastName: 'Nová',
      role: 'ORGANIZER',
    },
  });

  // Testovací akce
  await prisma.event.create({
    data: {
      title: 'Studentský ples 2024',
      description: 'Tradiční ples s bohatým programem',
      location: 'Praha, Lucerna',
      startDate: new Date('2024-03-15T19:00:00'),
      endDate: new Date('2024-03-16T02:00:00'),
      category: 'Večírek',
      totalTickets: 200,
      availableTickets: 200,
      ticketPrice: 250,
      status: 'PUBLISHED',
      organizerId: organizer.id,
    },
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

Přidejte do `backend/package.json`:
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

Spusťte seed:
```bash
npx prisma db seed
```

### Spuštění backend serveru

```bash
npm run dev
```

Backend běží na `http://localhost:3001` ✅

---

## 4. Frontend setup

### Instalace závislostí

V novém terminálu:

```bash
cd frontend
npm install
```

### Spuštění frontend aplikace

```bash
npm run dev
```

Frontend běží na `http://localhost:5173` ✅

---

## 5. Testování aplikace

### Otevřete prohlížeč

Přejděte na `http://localhost:5173`

### Testovací účty (pokud jste spustili seed)

**Admin:**
- Email: `admin@example.com`
- Heslo: `admin123`

**Organizátor:**
- Email: `organizer@example.com`
- Heslo: `organizer123`

**Nebo si vytvořte nový účet** pomocí registračního formuláře.

---

## 6. Struktura projektu

```
bakalarka/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/       # Database, JWT config
│   │   ├── controllers/  # Business logika
│   │   ├── middleware/   # Auth, error handling
│   │   ├── routes/       # API routes
│   │   └── index.ts      # Entry point
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
│
├── frontend/             # React + TypeScript
│   ├── src/
│   │   ├── components/   # React komponenty
│   │   ├── pages/        # Stránky
│   │   ├── store/        # State management
│   │   ├── lib/          # Utils
│   │   └── types/        # TypeScript types
│   └── package.json
│
├── docs/                 # Dokumentace
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   └── deployment.md
│
└── README.md
```

---

## 7. Užitečné příkazy

### Backend

```bash
# Development server
npm run dev

# Build pro produkci
npm run build

# Spuštění produkční verze
npm start

# Prisma Studio (GUI pro databázi)
npx prisma studio

# Kontrola chyb
npm run lint
```

### Frontend

```bash
# Development server
npm run dev

# Build pro produkci
npm run build

# Preview produkční build
npm run preview

# Kontrola chyb
npm run lint
```

---

## 8. Funkce aplikace

### Uživatelské role

✅ **Běžný uživatel**
- Prohlížení akcí
- Rezervace vstupenek
- Správa svých rezervací
- Podání reklamace

✅ **Organizátor**
- Vše co běžný uživatel
- Vytváření nových akcí
- Správa vlastních akcí
- Editace a rušení akcí

✅ **Administrátor**
- Vše co organizátor
- Správa všech uživatelů
- Správa všech akcí
- Řešení reklamací

### Hlavní funkce

✅ Autentizace (registrace, přihlášení)
✅ Správa akcí (CRUD operace)
✅ Rezervace vstupenek
✅ Online platby (Stripe integrace)
✅ Reklamace a vrácení peněz
✅ Filtrování a vyhledávání akcí
✅ Responzivní design

---

## 9. Řešení problémů

### Port už je používán

```bash
# Najděte proces
lsof -i :3001  # nebo :5173

# Ukončete proces
kill -9 <PID>
```

### Chyby s databází

```bash
# Reset databáze (POUZE development!)
cd backend
npx prisma migrate reset

# Znovu spusťte migrace
npx prisma migrate dev
```

### Chyby s dependencies

```bash
# Smažte node_modules a znovu instalujte
rm -rf node_modules package-lock.json
npm install
```

---

## 10. Další kroky

📚 **Přečtěte si dokumentaci:**
- [Architektura](./docs/architecture.md)
- [API dokumentace](./docs/api.md)
- [Databázové schéma](./docs/database.md)
- [Deployment](./docs/deployment.md)

🚀 **Pro produkční nasazení:**
- Nastavte produkční PostgreSQL databázi
- Nakonfigurujte Stripe pro live platby
- Nastavte SMTP server pro emaily
- Následujte [deployment guide](./docs/deployment.md)

---

## Kontakt a podpora

Pro otázky a podporu kontaktujte autora projektu.

**Licence:** MIT

---

**Úspěšného vývoje! 🎉**
