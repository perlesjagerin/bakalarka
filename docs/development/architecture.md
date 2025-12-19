# Architektura aplikace

## Přehled

Webová aplikace je postavena na moderní client-server architektuře s oddělením frontend a backend vrstev.

## Technologický stack

### Frontend
- **Framework**: React 18 s TypeScript
- **Build tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State management**: Zustand
- **HTTP klient**: Axios
- **Forms**: React Hook Form + Zod validace
- **Platby**: Stripe React SDK
- **UI komponenty**: Lucide React (ikony)
- **Notifikace**: React Hot Toast

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js s TypeScript
- **Databáze**: PostgreSQL
- **ORM**: Prisma
- **Autentizace**: JWT (jsonwebtoken)
- **Bezpečnost**: Helmet, CORS, Rate limiting
- **Platební brána**: Stripe API
- **Email**: Nodemailer
- **Validace**: Zod

## Architektura backend

```
backend/
├── src/
│   ├── config/           # Konfigurace (DB, JWT)
│   ├── controllers/      # Business logika
│   ├── middleware/       # Express middleware
│   ├── routes/           # API endpointy
│   └── index.ts          # Entry point
├── prisma/
│   └── schema.prisma     # Databázové schéma
└── package.json
```

### Databázové modely

#### User
- **Role**: ADMIN, ORGANIZER, USER
- **Atributy**: email, heslo (hashované), jméno, příjmení
- **Relace**: 1:N s Events (jako organizátor), 1:N s Reservations, 1:N s Complaints

#### Event
- **Status**: DRAFT, PUBLISHED, CANCELLED, COMPLETED
- **Atributy**: název, popis, místo, datum zahájení/ukončení, kategorie, cena, počet vstupenek
- **Relace**: N:1 s User (organizátor), 1:N s Reservations

#### Reservation
- **Status**: PENDING, CONFIRMED, CANCELLED, REFUNDED
- **Atributy**: počet vstupenek, celková cena, rezervační kód
- **Relace**: N:1 s Event, N:1 s User, 1:1 s Payment, 1:N s Complaints

#### Payment
- **Status**: PENDING, COMPLETED, FAILED, REFUNDED
- **Atributy**: částka, Stripe payment ID, platební metoda
- **Relace**: 1:1 s Reservation

#### Complaint
- **Status**: SUBMITTED, IN_REVIEW, REJECTED, RESOLVED
- **Atributy**: důvod, popis, odpověď admina
- **Relace**: N:1 s Reservation, N:1 s User

## Architektura frontend

```
frontend/
├── src/
│   ├── components/       # Znovupoužitelné komponenty
│   │   ├── layout/       # Layout komponenty
│   │   └── EventCard.tsx
│   ├── pages/            # Stránky aplikace
│   ├── store/            # Zustand stores
│   ├── lib/              # Utility funkce
│   ├── types/            # TypeScript typy
│   ├── App.tsx           # Hlavní komponenta
│   └── main.tsx          # Entry point
└── package.json
```

## Tok dat

### Autentizace
1. Uživatel se přihlásí (email + heslo)
2. Backend validuje údaje a vrací JWT token
3. Token se uloží v localStorage
4. Token se posílá v Authorization header při každém požadavku
5. Middleware na backendu ověřuje token

### Rezervace vstupenek
1. Uživatel vybere akci a počet vstupenek
2. Backend kontroluje dostupnost
3. Vytvoří se rezervace se statusem PENDING
4. Sníží se počet dostupných vstupenek
5. Uživatel je přesměrován na platbu
6. Po úspěšné platbě Stripe webhook aktualizuje status na CONFIRMED

### Platby (Stripe)
1. Frontend vytvoří Payment Intent přes backend
2. Backend vrací client secret
3. Stripe Elements zpracuje platbu na frontendu
4. Webhook potvrzení aktualizuje status v DB

## Bezpečnost

- **Hesla**: Hashována pomocí bcrypt (10 rounds)
- **JWT**: Platnost 7 dní, secret klíč v env proměnných
- **CORS**: Whitelist povolených originů
- **Rate limiting**: Max 100 požadavků za 15 minut
- **Helmet**: Security headers
- **Input validace**: Zod schema na backendu i frontendu

## API struktura

### Autentizace (`/api/auth`)
- `POST /register` - Registrace
- `POST /login` - Přihlášení
- `GET /me` - Aktuální uživatel (auth required)

### Uživatelé (`/api/users`)
- `GET /` - Seznam uživatelů (admin)
- `GET /:id` - Detail uživatele
- `PUT /:id` - Aktualizace profilu
- `DELETE /:id` - Deaktivace účtu (admin)

### Akce (`/api/events`)
- `GET /` - Seznam akcí (veřejné)
- `GET /:id` - Detail akce (veřejné)
- `POST /` - Vytvoření akce (organizer, admin)
- `GET /my/events` - Moje akce (organizer, admin)
- `PUT /:id` - Aktualizace akce (organizer, admin)
- `DELETE /:id` - Zrušení akce (organizer, admin)

### Rezervace (`/api/reservations`)
- `POST /` - Vytvoření rezervace (auth)
- `GET /my` - Moje rezervace (auth)
- `GET /:id` - Detail rezervace (auth)
- `PUT /:id` - Aktualizace rezervace (auth)
- `DELETE /:id` - Zrušení rezervace (auth)

### Platby (`/api/payments`)
- `POST /create-payment-intent` - Vytvoření platby (auth)
- `POST /webhook` - Stripe webhook
- `GET /:paymentId/status` - Status platby (auth)

### Reklamace (`/api/complaints`)
- `POST /` - Podání reklamace (auth)
- `GET /my` - Moje reklamace (auth)
- `GET /` - Všechny reklamace (admin)
- `PUT /:id/status` - Změna statusu (admin)
- `POST /:id/resolve` - Vyřešení reklamace (admin)

## Škálování a výkon

### Optimalizace
- Connection pooling v Prisma
- Indexy v databázi na často dotazované sloupce
- Rate limiting pro ochranu proti DDoS
- Lazy loading komponent na frontendu
- Image optimalizace

### Budoucí vylepšení
- Redis cache pro session management
- CDN pro statické assety
- Separátní mikroslužby pro platby a emaily
- WebSocket pro real-time aktualizace dostupnosti vstupenek
- Elasticsearch pro pokročilé vyhledávání
