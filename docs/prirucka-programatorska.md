# Programátorská příručka
## Rezervační systém pro studentské akce

---

## 1. Úvod

Tato příručka slouží jako technická dokumentace pro vývojáře, kteří chtějí rozumět struktuře aplikace, upravit ji nebo ji rozšířit. Aplikace je implementována jako fullstack webová aplikace s odděleným backendem a frontendem.

---

## 2. Architektura aplikace

### 2.1 Celková struktura

```
bakalarka/
├── backend/          # Node.js + Express backend
├── frontend/         # React + Vite frontend
├── docs/            # Dokumentace
└── kidiplom/        # LaTeX bakalářská práce
```

### 2.2 Backend architektura (MVC pattern)

Backend využívá třívrstvou architekturu:

- **Controllers** - zpracování HTTP requestů a responses
- **Services** - business logika
- **Database** - Prisma ORM s PostgreSQL

```
backend/
├── src/
│   ├── controllers/    # HTTP request handlery
│   ├── services/       # Business logika
│   ├── middleware/     # Autentizace, validace, error handling
│   ├── routes/         # API endpointy
│   ├── utils/          # Pomocné funkce
│   └── index.ts        # Entry point
├── prisma/
│   └── schema.prisma   # Databázové schéma
└── package.json
```

### 2.3 Frontend architektura

Frontend využívá komponentovou architekturu s hooks a custom hooks pro API komunikaci:

```
frontend/
├── src/
│   ├── components/     # React komponenty
│   ├── pages/          # Stránky (React Router)
│   ├── hooks/          # Custom hooks pro API
│   ├── stores/         # Zustand state management
│   ├── services/       # API client (Axios)
│   └── utils/          # Pomocné funkce
└── package.json
```

---

## 3. Klíčové datové struktury

### 3.1 Databázové modely

#### User (Uživatel)
```typescript
{
  id: string              // UUID
  email: string           // Unique
  password: string        // Bcrypt hash
  firstName: string
  lastName: string
  role: UserRole          // ADMIN | ORGANIZER | USER
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Event (Akce)
```typescript
{
  id: string
  title: string
  description: string
  location: string
  startDate: DateTime
  endDate: DateTime
  category: string
  imageUrl?: string
  totalTickets: number
  availableTickets: number
  ticketPrice: Decimal
  status: EventStatus     // DRAFT | PUBLISHED | CANCELLED | COMPLETED
  organizerId: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Reservation (Rezervace)
```typescript
{
  id: string
  eventId: string
  userId: string
  ticketCount: number
  totalAmount: Decimal
  status: ReservationStatus  // PENDING | PAID | CANCELLED | REFUNDED
  reservationCode: string    // Unique 8-char code
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Payment (Platba)
```typescript
{
  id: string
  reservationId: string
  amount: Decimal
  status: PaymentStatus      // PENDING | COMPLETED | FAILED | REFUNDED
  stripePaymentId?: string
  paymentMethod?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Complaint (Reklamace)
```typescript
{
  id: string
  reservationId: string
  userId: string
  reason: string
  description: string
  status: ComplaintStatus    // SUBMITTED | IN_REVIEW | REJECTED | RESOLVED
  adminResponse?: string
  refundIssued: boolean
  createdAt: DateTime
  updatedAt: DateTime
  resolvedAt?: DateTime
}
```

---

## 4. Klíčové algoritmy

### 4.1 Autentizace (JWT)

**Generování tokenů:**
```typescript
function generateTokens(userId: string) {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}
```

**Middleware pro ověření:**
```typescript
async function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}
```

### 4.2 Vytvoření rezervace s atomickou transakcí

```typescript
async createReservation(reservationData) {
  return await prisma.$transaction(async (tx) => {
    // 1. Kontrola dostupnosti vstupenek
    const event = await tx.event.findUnique({
      where: { id: reservationData.eventId }
    });
    
    if (event.availableTickets < reservationData.ticketCount) {
      throw new Error('Not enough tickets available');
    }
    
    // 2. Snížení dostupných vstupenek
    await tx.event.update({
      where: { id: event.id },
      data: {
        availableTickets: event.availableTickets - reservationData.ticketCount
      }
    });
    
    // 3. Vytvoření rezervace
    const reservation = await tx.reservation.create({
      data: {
        ...reservationData,
        reservationCode: generateReservationCode(),
        status: event.ticketPrice > 0 ? 'PENDING' : 'PAID'
      }
    });
    
    // 4. Vytvoření payment záznamu
    await tx.payment.create({
      data: {
        reservationId: reservation.id,
        amount: reservation.totalAmount,
        status: event.ticketPrice > 0 ? 'PENDING' : 'COMPLETED'
      }
    });
    
    return reservation;
  });
}
```

### 4.3 Stripe Webhook handling

```typescript
async handleWebhook(event) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      await prisma.$transaction(async (tx) => {
        // Najdi payment podle Stripe ID
        const payment = await tx.payment.findFirst({
          where: { stripePaymentId: paymentIntent.id }
        });
        
        // Aktualizuj payment status
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'COMPLETED' }
        });
        
        // Aktualizuj rezervaci
        const reservation = await tx.reservation.update({
          where: { id: payment.reservationId },
          data: { status: 'PAID' },
          include: { event: true, user: true }
        });
        
        // Odešli potvrzující email
        await emailService.sendPaymentConfirmation(reservation);
      });
      break;
      
    case 'payment_intent.payment_failed':
      // Handle failed payment
      break;
  }
}
```

### 4.4 Refundace s automatickým zrušením

```typescript
async processRefund(reservationId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Najdi rezervaci a platbu
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
      include: { payment: true, event: true }
    });
    
    // 2. Proveď Stripe refund (pokud nebyla zdarma)
    if (reservation.totalAmount > 0) {
      await stripe.refunds.create({
        payment_intent: reservation.payment.stripePaymentId
      });
      
      await tx.payment.update({
        where: { id: reservation.payment.id },
        data: { status: 'REFUNDED' }
      });
    }
    
    // 3. Aktualizuj rezervaci
    await tx.reservation.update({
      where: { id: reservationId },
      data: { status: 'REFUNDED' }
    });
    
    // 4. Vrať vstupenky do eventu
    await tx.event.update({
      where: { id: reservation.eventId },
      data: {
        availableTickets: {
          increment: reservation.ticketCount
        }
      }
    });
    
    return reservation;
  });
}
```

### 4.5 Generování PDF vstupenky s QR kódem

```typescript
async generateTicketPDF(reservation) {
  // 1. Vygeneruj QR kód
  const qrCodeDataUrl = await QRCode.toDataURL(
    JSON.stringify({
      reservationCode: reservation.reservationCode,
      eventId: reservation.eventId,
      userId: reservation.userId
    })
  );
  
  // 2. Vytvoř PDF dokument
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks = [];
  
  doc.on('data', (chunk) => chunks.push(chunk));
  
  // 3. Přidej obsah
  doc.font('Arial')
     .fontSize(24)
     .text('Vstupenka', { align: 'center' });
  
  doc.fontSize(16)
     .text(reservation.event.title, { align: 'center' });
  
  // Detaily události
  doc.fontSize(12)
     .text(`Místo: ${reservation.event.location}`)
     .text(`Datum: ${formatDate(reservation.event.startDate)}`)
     .text(`Počet vstupenek: ${reservation.ticketCount}`)
     .text(`Celková cena: ${reservation.totalAmount} Kč`);
  
  // QR kód
  doc.image(qrCodeDataUrl, {
    fit: [200, 200],
    align: 'center'
  });
  
  doc.text(`Rezervační kód: ${reservation.reservationCode}`, {
    align: 'center'
  });
  
  doc.end();
  
  // 4. Vrať PDF buffer
  return Buffer.concat(chunks);
}
```

---

## 5. Možnosti rozšíření

### 5.1 Přidání nové entity

1. **Aktualizuj Prisma schema:**
```prisma
model NewEntity {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  
  @@map("new_entities")
}
```

2. **Spusť migrace:**
```bash
npx prisma migrate dev --name add_new_entity
```

3. **Vytvoř Service:**
```typescript
// src/services/newEntity.service.ts
export class NewEntityService {
  async create(data) {
    return await prisma.newEntity.create({ data });
  }
  
  async getAll() {
    return await prisma.newEntity.findMany();
  }
}
```

4. **Vytvoř Controller:**
```typescript
// src/controllers/newEntity.controller.ts
export class NewEntityController {
  private service = new NewEntityService();
  
  async create(req, res) {
    const data = await this.service.create(req.body);
    res.json(data);
  }
}
```

5. **Přidej routes:**
```typescript
// src/routes/newEntity.routes.ts
router.post('/', controller.create);
router.get('/', controller.getAll);
```

### 5.2 Přidání nového typu notifikace

1. **Rozšiř EmailService:**
```typescript
async sendNewNotification(data) {
  const template = this.createEmailTemplate('newNotification', data);
  
  await this.transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.email,
    subject: 'New Notification',
    html: template
  });
}
```

2. **Zavolej z příslušného service:**
```typescript
await emailService.sendNewNotification({
  email: user.email,
  data: someData
});
```

### 5.3 Přidání nové platební metody

1. **Vytvoř nový payment provider:**
```typescript
// src/services/paypal.service.ts
export class PayPalService {
  async createPayment(amount) {
    // PayPal API integration
  }
  
  async handleWebhook(event) {
    // Handle PayPal webhook
  }
}
```

2. **Aktualizuj PaymentService:**
```typescript
async createPayment(reservationId, method: 'stripe' | 'paypal') {
  if (method === 'stripe') {
    return await this.stripeService.createPayment(...);
  } else if (method === 'paypal') {
    return await this.paypalService.createPayment(...);
  }
}
```

### 5.4 Přidání nové role

1. **Aktualizuj Prisma enum:**
```prisma
enum UserRole {
  ADMIN
  ORGANIZER
  USER
  NEW_ROLE  // Nová role
}
```

2. **Aktualizuj middleware:**
```typescript
const roleMiddleware = (allowedRoles: UserRole[]) => {
  return async (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
```

3. **Použij v routes:**
```typescript
router.get('/new-endpoint', 
  authenticateToken,
  roleMiddleware(['NEW_ROLE', 'ADMIN']),
  controller.newAction
);
```

---

## 6. Testování

### 6.1 Frontend testy (Vitest)

```bash
cd frontend
npm test
```

Spouští unit testy pro komponenty, utility funkce a konstanty.

### 6.2 Backend testy (Jest)

```bash
cd backend
npm test
```

Spouští integration testy pro všechny API endpointy.

### 6.3 E2E testy (Playwright)

```bash
cd frontend
npx playwright test
```

Spouští end-to-end testy celého user flow.

---

## 7. Deployment

### 7.1 Příprava

1. **Environment variables:**
```env
# Backend
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=

# Frontend
VITE_API_URL=
VITE_STRIPE_PUBLISHABLE_KEY=
```

2. **Build:**
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### 7.2 Docker deployment

```bash
docker-compose up -d
```

### 7.3 Cloud deployment

Viz `docs/deployment/deployment-guide.md` pro detailní instrukce pro:
- Heroku
- Railway
- AWS
- Vercel + Render

---

## 8. Kontakty a podpora

Pro dotazy týkající se této aplikace kontaktujte autora nebo konzultujte dokumentaci v repozitáři.

**GitHub:** https://github.com/perlesjagerin/bakalarka

---

**Verze dokumentu:** 1.0  
**Datum:** 24. 12. 2024
