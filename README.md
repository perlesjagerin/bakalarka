# Webová aplikace pro rezervaci vstupenek na studentské akce

> 🚀 **Pro rychlé zprovoznění**: [docs/getting-started/](docs/getting-started/) (Docker nebo manuální instalace)  
> 📦 **Pro odevzdání**: [docs/project/submission.md](docs/project/submission.md) (kompletní checklist a návod)  
> 📚 **Veškerá dokumentace**: [docs/](docs/) (architektura, API, deployment, testy)

## 📝 Popis projektu

Webová aplikace sloužící jako obchod se vstupenkami na studentské akce. Umožňuje organizátorům vytvářet a spravovat akce a uživatelům rezervovat, platit a spravovat vstupenky.

## 🎯 Funkcionalita

### Uživatelské role
- **Administrátor** - plný přístup ke všem funkcím systému
- **Organizátor** - správa vlastních akcí (vytváření, úprava, rušení)
- **Běžný uživatel** - prohlížení akcí a rezervace vstupenek

### Hlavní funkce
✅ **Uživatelské účty**
- Registrace a přihlášení s JWT autentizací
- Tři uživatelské role: Admin, Organizátor, Uživatel
- Správa profilu

✅ **Správa akcí**
- CRUD operace pro organizátory
- Filtrování podle kategorií (Hudba, Divadlo, Film, Sport, Technologie, atd.)
- Vyhledávání akcí
- Detail akce s možností rezervace

✅ **Rezervace a platby**
- Rezervace lístků s výběrem počtu
- Integrace Stripe platby
- Stripe Webhook pro automatické potvrzení
- Správa rezervací (zrušení, úprava)

✅ **Reklamace**
- Systém reklamací pro uživatele
- Admin dashboard pro správu reklamací
- Refundace s automatickou aktualizací všech souvisejících reklamací
- Stavy: SUBMITTED → IN_REVIEW → RESOLVED/REJECTED

✅ **Admin panel**
- Správa všech akcí od všech organizátorů
- Správa uživatelů (aktivace/deaktivace)
- Správa všech reklamací
- Statistiky a přehledy

## 🛠️ Technologie

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js + Express + TypeScript
- PostgreSQL
- Prisma ORM
- JWT autentizace
- Stripe (platební brána)

## 📁 Struktura projektu

```
bakalarka/
├── frontend/              # React aplikace (Vite + TypeScript)
│   ├── src/
│   │   ├── components/    # React komponenty
│   │   ├── pages/         # Stránky (routing)
│   │   ├── store/         # Zustand state management
│   │   ├── lib/           # Utility funkce (axios)
│   │   └── constants/     # Konstanty (kategorie)
│   └── public/            # Statické soubory
├── backend/               # Express API server (TypeScript)
│   ├── src/
│   │   ├── controllers/   # Business logika
│   │   ├── routes/        # API endpointy
│   │   ├── middleware/    # Auth, error handling
│   │   └── config/        # Konfigurace (DB, Stripe)
│   ├── prisma/            # Databázové schéma a migrace
│   └── tests/             # Backend testy (performance, security, unit)
├── docs/                  # 📚 Kompletní dokumentace
│   ├── getting-started/   # Quick start, instalace, Docker
│   ├── development/       # Architektura, API, databáze, testování
│   ├── deployment/        # Deployment návody, production checklist
│   └── project/           # Odevzdání, implementované funkce, TODO
└── scripts/               # Build a utility skripty
```

## 🚀 Rychlý start

### Option 1: Docker (doporučeno - nejrychlejší)

```bash
# Jediný prerekvizit: Docker Desktop
docker-compose up
# Otevřete http://localhost:5173
```

📖 **Detailní návod**: [docs/getting-started/docker.md](docs/getting-started/docker.md)

---

### Option 2: Manuální instalace

**Prerekvizity:**
- Node.js 18+
- PostgreSQL 14.20
- npm
- Stripe účet (pro testování plateb)

**Instalace:**

1. **Naklonujte projekt a nainstalujte závislosti:**
```bash
git clone <repository-url>
cd bakalarka
npm install  # Nainstaluje závislosti pro všechny workspace
```

2. **Nastavte databázi:**
```bash
# Vytvořte PostgreSQL databázi
psql -U postgres
CREATE DATABASE ticket_reservation;
\q
```

3. **Nakonfigurujte backend:**
```bash
cd backend
cp .env.example .env
# Upravte .env soubor (DATABASE_URL, STRIPE_SECRET_KEY, JWT_SECRET)

# Spusťte migrace a seed
npx prisma migrate dev
npx prisma db seed
```

4. **Spusťte aplikaci:**
```bash
cd ..
npm run dev  # Spustí backend (3001) i frontend (5173) zároveň
```

**Testovací účty:**
- Admin: `admin@example.com` / `admin123`
- Organizátor: `organizer@example.com` / `organizer123`
- Uživatel: `user@example.com` / `user123`

📖 **Podrobnější návod**: [docs/getting-started/installation.md](docs/getting-started/installation.md)

## � Deployment

Návod na nasazení do produkce najdete v [docs/deployment/deployment.md](docs/deployment/deployment.md).

Quick links:
- [Railway + Vercel Setup](docs/deployment/deployment.md#rychlý-start-railway--vercel)
- [Alternative Deployment Options](docs/deployment/deployment.md#alternativní-deployment-možnosti)
- [Production Checklist](docs/deployment/production-checklist.md)

## 📚 Dokumentace

Veškerá dokumentace je v [docs/](docs/) složce, organizovaná do kategorií:

### 🚀 Getting Started - Pro začátečníky
- [Quick Start](docs/getting-started/README.md) - Rychlý přehled možností spuštění
- [Docker Setup](docs/getting-started/docker.md) - Spuštění s Dockerem (1 příkaz)
- [Installation Guide](docs/getting-started/installation.md) - Detailní manuální instalace

### 👨‍💻 Development - Pro vývojáře
- [Architecture](docs/development/architecture.md) - Architektura aplikace, technologie, struktura
- [API Documentation](docs/development/api.md) - REST API endpointy, autentizace
- [Database Schema](docs/development/database.md) - Prisma schéma, relace, migrace
- [Testing](docs/development/testing.md) - Unit, integration a performance testy

### 🚀 Deployment - Pro produkci
- [Deployment Guide](docs/deployment/deployment.md) - Railway + Vercel deployment
- [Production Checklist](docs/deployment/production-checklist.md) - Checklist před nasazením

### 📦 Project - Pro odevzdání/správu
- [Submission Guide](docs/project/submission.md) - Návod pro odevzdání bakalářky
- [Implemented Features](docs/project/implemented.md) - Seznam implementovaných funkcí
- [TODO & Future Features](docs/project/todo.md) - Plánované funkce

**Spusťte testy:**
```bash
npm test                  # Všechny testy (backend + frontend)
npm run test:api          # Backend API response time testy
npm run test:lighthouse   # Frontend Lighthouse performance
```

## 👨‍💻 Autor

Bakalářská práce - Webová aplikace pro rezervaci vstupenek na studentské akce

## 📄 Licence

MIT
