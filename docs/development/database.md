# Databázové schéma

## Entity-Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│    User     │──────<│    Event    │>──────│ Reservation  │
└─────────────┘       └─────────────┘       └──────────────┘
      │                                             │
      │                                             │
      │                                             ├──────┐
      │                                             │      │
      │               ┌──────────────┐              │      │
      └──────────────>│  Complaint   │<─────────────┘      │
                      └──────────────┘                     │
                                                           │
                                                           v
                                                    ┌──────────┐
                                                    │ Payment  │
                                                    └──────────┘
```

## Tabulky

### users
Uživatelské účty v systému.

| Sloupec      | Typ        | Popis                              |
|--------------|------------|------------------------------------|
| id           | UUID       | Primární klíč (generován)          |
| email        | String     | Email (unikátní, indexed)          |
| password     | String     | Hashované heslo (bcrypt)           |
| firstName    | String     | Křestní jméno                      |
| lastName     | String     | Příjmení                           |
| role         | Enum       | ADMIN, ORGANIZER, USER             |
| isActive     | Boolean    | Aktivní/neaktivní účet             |
| createdAt    | DateTime   | Datum vytvoření                    |
| updatedAt    | DateTime   | Datum poslední aktualizace         |

**Indexy:**
- `email` (unique)

**Relace:**
- 1:N s `events` (jako organizátor)
- 1:N s `reservations`
- 1:N s `complaints`

---

### events
Studentské akce.

| Sloupec          | Typ        | Popis                              |
|------------------|------------|------------------------------------|
| id               | UUID       | Primární klíč                      |
| title            | String     | Název akce                         |
| description      | String     | Detailní popis                     |
| location         | String     | Místo konání                       |
| startDate        | DateTime   | Datum a čas zahájení               |
| endDate          | DateTime   | Datum a čas ukončení               |
| category         | String     | Kategorie (Koncert, Sport, atd.)   |
| imageUrl         | String?    | URL obrázku (optional)             |
| totalTickets     | Int        | Celkový počet vstupenek            |
| availableTickets | Int        | Dostupné vstupenky                 |
| ticketPrice      | Decimal    | Cena vstupenky (Kč)                |
| status           | Enum       | DRAFT, PUBLISHED, CANCELLED, COMPLETED |
| organizerId      | UUID       | Foreign key → users.id             |
| createdAt        | DateTime   | Datum vytvoření                    |
| updatedAt        | DateTime   | Datum aktualizace                  |

**Indexy:**
- `organizerId`
- `status`
- `startDate`
- `category`

**Relace:**
- N:1 s `users` (organizátor)
- 1:N s `reservations`

**Business logika:**
- `availableTickets` se automaticky snižuje při vytvoření rezervace
- `availableTickets` se zvyšuje při zrušení rezervace
- Nelze rezervovat více vstupenek než je `availableTickets`

---

### reservations
Rezervace vstupenek uživateli.

| Sloupec         | Typ        | Popis                              |
|-----------------|------------|------------------------------------|
| id              | UUID       | Primární klíč                      |
| eventId         | UUID       | Foreign key → events.id            |
| userId          | UUID       | Foreign key → users.id             |
| ticketCount     | Int        | Počet rezervovaných vstupenek      |
| totalAmount     | Decimal    | Celková cena (Kč)                  |
| status          | Enum       | PENDING, CONFIRMED, CANCELLED, REFUNDED |
| reservationCode | String     | Unikátní kód rezervace (8 znaků)   |
| createdAt       | DateTime   | Datum vytvoření                    |
| updatedAt       | DateTime   | Datum aktualizace                  |

**Indexy:**
- `userId`
- `eventId`
- `status`
- `reservationCode` (unique)

**Relace:**
- N:1 s `events`
- N:1 s `users`
- 1:1 s `payments`
- 1:N s `complaints`

**Status flow:**
```
PENDING → CONFIRMED (po úspěšné platbě)
PENDING → CANCELLED (zrušení uživatelem)
CONFIRMED → CANCELLED (zrušení akce)
CANCELLED → REFUNDED (po schválení reklamace)
```

---

### payments
Platby za rezervace.

| Sloupec         | Typ        | Popis                              |
|-----------------|------------|------------------------------------|
| id              | UUID       | Primární klíč                      |
| reservationId   | UUID       | Foreign key → reservations.id (unique) |
| amount          | Decimal    | Částka k platbě (Kč)               |
| status          | Enum       | PENDING, COMPLETED, FAILED, REFUNDED |
| stripePaymentId | String?    | ID platby ve Stripe                |
| paymentMethod   | String?    | Způsob platby (card, atd.)         |
| createdAt       | DateTime   | Datum vytvoření                    |
| updatedAt       | DateTime   | Datum aktualizace                  |

**Indexy:**
- `stripePaymentId`

**Relace:**
- 1:1 s `reservations`

**Status flow:**
```
PENDING → COMPLETED (webhook od Stripe)
PENDING → FAILED (chyba platby)
COMPLETED → REFUNDED (po schválení reklamace)
```

---

### complaints
Reklamace vstupenek/služeb.

| Sloupec       | Typ        | Popis                              |
|---------------|------------|------------------------------------|
| id            | UUID       | Primární klíč                      |
| reservationId | UUID       | Foreign key → reservations.id      |
| userId        | UUID       | Foreign key → users.id             |
| reason        | String     | Důvod reklamace                    |
| description   | String     | Detailní popis problému            |
| status        | Enum       | SUBMITTED, IN_REVIEW, REJECTED, RESOLVED |
| adminResponse | String?    | Odpověď administrátora             |
| createdAt     | DateTime   | Datum podání                       |
| updatedAt     | DateTime   | Datum aktualizace                  |
| resolvedAt    | DateTime?  | Datum vyřešení                     |

**Indexy:**
- `userId`
- `reservationId`
- `status`

**Relace:**
- N:1 s `reservations`
- N:1 s `users`

**Status flow:**
```
SUBMITTED → IN_REVIEW (admin začne řešit)
IN_REVIEW → RESOLVED (reklamace schválena a vyřešena, refund proveden pokud je potvrzen)
IN_REVIEW → REJECTED (reklamace zamítnuta)
```

---

## Migrace

### Vytvoření databáze

```bash
# V backend složce
npx prisma migrate dev --name init
```

### Generování Prisma klienta

```bash
npx prisma generate
```

### Spuštění Prisma Studio (GUI pro DB)

```bash
npx prisma studio
```

---

## Seed data

Pro vývoj můžete vytvořit seed script v `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Vytvoření admin uživatele
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  // Vytvoření organizátora
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

  // Vytvoření testovací akce
  await prisma.event.create({
    data: {
      title: 'Studentský ples 2024',
      description: 'Tradiční studentský ples s bohatým programem',
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

  console.log('Seed data vytvořena!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Spuštění seedu:
```bash
npx prisma db seed
```

---

## Backup a Restore

### Backup
```bash
pg_dump -U username -d ticket_reservation > backup.sql
```

### Restore
```bash
psql -U username -d ticket_reservation < backup.sql
```

---

## Performance optimalizace

### Connection pooling
Prisma automaticky používá connection pool. Konfigurace v DATABASE_URL:
```
postgresql://user:pass@localhost:5432/db?connection_limit=20&pool_timeout=30
```

### Indexy
Všechny foreign keys a často dotazované sloupce mají indexy.

### Transakce
Kritické operace (rezervace, platby) používají transakce:
```typescript
await prisma.$transaction(async (tx) => {
  // Atomické operace
});
```
