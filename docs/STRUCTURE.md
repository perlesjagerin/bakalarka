# 📋 Struktura projektu

Kompletní přehled adresářové struktury projektu po reorganizaci (prosinec 2024).

## 📂 Root struktura

```
bakalarka/
├── README.md                   # 📖 Hlavní vstupní bod, quick start
├── docker-compose.yml          # 🐳 Docker orchestrace
├── package.json                # 📦 Root npm skripty a workspaces
├── .gitignore                  # 🚫 Git ignore rules
│
├── backend/                    # 🔙 Backend aplikace
├── frontend/                   # 🎨 Frontend aplikace
├── docs/                       # 📚 Veškerá dokumentace
└── scripts/                    # 🔧 Utility skripty
```

---

## 🔙 Backend struktura

```
backend/
├── src/                        # Zdrojový kód
│   ├── controllers/           # Business logika
│   ├── routes/                # API endpointy
│   ├── middleware/            # Auth, validace, error handling
│   ├── config/                # Konfigurace (DB, Stripe)
│   ├── utils/                 # Utility funkce
│   └── __tests__/            # Unit testy (56 tests)
│
├── prisma/                     # Databáze
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Migrace
│   └── seed.ts                # Seed data
│
├── tests/                      # Testy přesunuté z root
│   ├── performance/           # API performance testy
│   ├── security/              # Security vulnerability testy
│   └── unit/                  # Additional unit tests
│
├── scripts/                    # Build skripty
├── .env.example               # Environment variables template
├── package.json               # Backend dependencies
└── tsconfig.json              # TypeScript konfigurace
```

---

## 🎨 Frontend struktura

```
frontend/
├── src/                        # Zdrojový kód
│   ├── components/            # React komponenty
│   │   └── __tests__/        # Component testy
│   ├── pages/                 # Stránky (routing)
│   │   └── __tests__/        # Page testy
│   ├── store/                 # Zustand state management
│   ├── lib/                   # Axios, API client
│   ├── types/                 # TypeScript typy
│   ├── constants/             # Konstanty (kategorie)
│   └── test/                  # Test utilities
│
├── public/                     # Statické soubory
├── .env.example               # Environment variables template
├── package.json               # Frontend dependencies
├── vite.config.ts             # Vite konfigurace
└── tsconfig.json              # TypeScript konfigurace
```

---

## 📚 Dokumentace struktura (NOVÁ)

Veškerá dokumentace organizovaná do kategorií:

```
docs/
├── README.md                   # 📖 Přehled celé dokumentace
│
├── getting-started/            # 🚀 PRO ZAČÁTEČNÍKY
│   ├── README.md              # Quick start guide
│   ├── installation.md        # Detailní instalační návod
│   └── docker.md              # Docker setup (1 příkaz)
│
├── development/                # 👨‍💻 PRO VÝVOJÁŘE
│   ├── architecture.md        # Architektura, technologie
│   ├── api.md                 # API dokumentace + příklady
│   ├── database.md            # Prisma schema, migrace
│   ├── testing.md             # Testing strategie
│   └── notes.md               # Development poznámky
│
├── deployment/                 # 🚀 PRO PRODUKCI
│   ├── deployment.md          # Railway + Vercel návod
│   └── production-checklist.md # Pre-deployment checklist
│
└── project/                    # 📦 PRO SPRÁVU PROJEKTU
    ├── submission.md          # Návod pro odevzdání BP
    ├── implemented.md         # Seznam hotových funkcí
    └── todo.md                # TODO list, plánované funkce
```

### Logika organizace dokumentace:

1. **getting-started/** - Člověk, který vidí projekt poprvé
   - Jak co nejrychleji zprovoznit
   - Docker nebo manuální instalace
   
2. **development/** - Vývojář, který chce rozumět kódu
   - Jak funguje architektura
   - Kde najít API endpointy
   - Jak pracovat s databází
   
3. **deployment/** - DevOps, nasazení do produkce
   - Konkrétní kroky pro Railway + Vercel
   - Production checklist
   
4. **project/** - Vedoucí BP, projektový management
   - Co odevzdat a jak
   - Co je hotové
   - Co plánujeme

---

## 🔧 Scripts struktura (NOVÁ)

Utility skripty pro build, testování, deployment:

```
scripts/
├── README.md                   # Dokumentace skriptů
│
└── lighthouse/                 # Lighthouse CI
    ├── lighthouse.config.js   # Konfigurace
    └── .lighthouseci/         # Výsledky testů
```

**Plánované rozšíření:**
```
scripts/
├── lighthouse/
├── build/                     # Build utility
├── deploy/                    # Deployment automation
└── database/                  # DB utilities (backup, restore)
```

---

## 📊 Změny proti původní struktuře

### ✅ Co bylo přesunuto:

| Původní umístění | Nové umístění | Důvod |
|-----------------|---------------|-------|
| `/INSTALLATION.md` | `/docs/getting-started/installation.md` | Konsolidace dokumentace |
| `/QUICK_START_DOCKER.md` | `/docs/getting-started/docker.md` | Konsolidace dokumentace |
| `/ODEVZDANI.md` | `/docs/project/submission.md` | Logické seskupení |
| `/PRODUCTION_CHECKLIST.md` | `/docs/deployment/production-checklist.md` | Deployment sekce |
| `/docs/IMPLEMENTED.md` | `/docs/project/implemented.md` | Projektový management |
| `/docs/TODO.md` | `/docs/project/todo.md` | Projektový management |
| `/docs/TESTING.md` | `/docs/development/testing.md` | Development dokumentace |
| `/tests/` | `/backend/tests/` | Backend-specific testy |
| `/.lighthouseci/` | `/scripts/lighthouse/.lighthouseci/` | Utility skripty |

### ✅ Co bylo přidáno:

- `/docs/README.md` - Centrální přehled dokumentace
- `/docs/getting-started/README.md` - Quick start guide
- `/backend/tests/README.md` - Dokumentace testů
- `/scripts/README.md` - Dokumentace skriptů
- Tato struktura dokumentace

### ✅ Co zůstalo beze změny:

- `/README.md` - Hlavní vstupní bod (aktualizovány odkazy)
- `/docker-compose.yml` - Docker orchestrace
- `/backend/src/` - Backend zdrojový kód
- `/frontend/src/` - Frontend zdrojový kód
- `/backend/prisma/` - Databázové schéma

---

## 🎯 Výhody nové struktury

### 1. **Přehlednost**
- ✅ Všechna dokumentace na jednom místě (`docs/`)
- ✅ Logické kategorie (getting-started, development, deployment, project)
- ✅ README v každé složce pro orientaci

### 2. **Efektivita**
- ✅ Testy tam, kde patří (`backend/tests/`)
- ✅ Utility skripty v `scripts/`
- ✅ Žádné volné soubory v root složce

### 3. **Škálovatelnost**
- ✅ Snadné přidávání nové dokumentace
- ✅ Jasné konvence pro nové soubory
- ✅ Připraveno pro další utility skripty

### 4. **Profesionalita**
- ✅ Struktura jako u enterprise projektů
- ✅ Konzistentní organizace
- ✅ Snadná orientace pro nové členy týmu

---

## 📝 Konvence

### Pojmenování souborů:
- Markdown: `lowercase-with-dashes.md`
- README vždy s velkým R: `README.md`
- Konfigurace: `kebab-case.config.js`

### Organizace:
- Dokumentace: markdown v `docs/`
- Testy: blízko kódu, který testují
- Skripty: utility v `scripts/`
- Root: pouze nutné konfigurace

### Odkazy:
- Vždy relativní cesty
- Kontrolovat při přesunu souborů
- README jako index pro každou složku

---

## 🔍 Rychlé odkazy

- [Hlavní README](../README.md)
- [Dokumentace přehled](../docs/README.md)
- [Quick start](../docs/getting-started/README.md)
- [API dokumentace](../docs/development/api.md)
- [Deployment návod](../docs/deployment/deployment.md)

---

**Poslední aktualizace:** Prosinec 2024  
**Změny:** Kompletní reorganizace dokumentace a testů
