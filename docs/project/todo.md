# Rozšíření projektu - Další funkce k implementaci

Tento dokument obsahuje návrhy na rozšíření aplikace o další užitečné funkce.

## ✅ Implementované funkce

### ✅ 1. Kompletní stránka Detail události
**Status:** ✅ **HOTOVO**  
**Popis:** Detailní zobrazení akce s možností rezervace přímo na stránce.

**Komponenty:**
- Velký obrázek akce
- Kompletní informace (datum, čas, místo, popis)
- Organizátor kontakt
- Mapa s umístěním
- Výběr počtu vstupenek
- Tlačítko "Rezervovat"
- Seznam podobných akcí

**Backend:** Již implementováno v `GET /events/:id`

**Frontend soubor:** `frontend/src/pages/EventDetailPage.tsx`

---

### ✅ 2. Kompletní rezervační proces s platbou
**Status:** ✅ **HOTOVO**  
**Popis:** Integrace Stripe Elements pro bezpečné platby.

**Komponenty:**
- Shrnutí rezervace
- Stripe payment form
- Potvrzení platby
- Zobrazení QR kódu vstupenky

**Soubory k implementaci:**
```typescript
// frontend/src/components/CheckoutForm.tsx
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../lib/axios';

export default function CheckoutForm({ reservationId, amount }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vytvoření payment intent
    const { data } = await api.post('/payments/create-payment-intent', {
      reservationId
    });

    // Potvrzení platby
    const result = await stripe.confirmCardPayment(data.clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      }
    });

    if (result.error) {
      // Zobrazit chybu
    } else {
      // Úspěch - přesměrovat na potvrzení
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit">Zaplatit {amount} Kč</button>
    </form>
  );
}
```

---

### ✅ 3. Správa vlastních akcí (Organizátor dashboard)
**Status:** ✅ **HOTOVO**  
**Popis:** Přehledný dashboard pro organizátory s jejich akcemi.

**Funkce:**
- Seznam všech mých akcí
- Filtry (nadcházející, proběhlé, zrušené)
- Tlačítko "Vytvořit novou akci"
- Upravit/Zrušit akci
- Statistiky (prodané vstupenky, výdělek)

**Frontend soubor:** `frontend/src/pages/MyEventsPage.tsx`

```typescript
// Příklad implementace
import { useState, useEffect } from 'react';
import api from '../lib/axios';

export default function MyEventsPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/events/my/events').then(res => setEvents(res.data.events));
  }, []);

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1>Moje akce</h1>
        <Link to="/events/create" className="btn-primary">
          Vytvořit akci
        </Link>
      </div>
      
      <div className="grid gap-4">
        {events.map(event => (
          <EventManagementCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
```

---

### ✅ 4. Formulář pro vytvoření akce
**Status:** ✅ **HOTOVO**  
**Popis:** Formulář s validací pro vytváření nových akcí.

**Frontend soubor:** `frontend/src/pages/CreateEventPage.tsx`

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const eventSchema = z.object({
  title: z.string().min(1, 'Název je povinný'),
  description: z.string().min(10, 'Popis musí mít alespoň 10 znaků'),
  location: z.string().min(1, 'Místo je povinné'),
  startDate: z.string(),
  endDate: z.string(),
  category: z.string(),
  totalTickets: z.number().positive(),
  ticketPrice: z.number().nonnegative(),
  imageUrl: z.string().url().optional(),
});

export default function CreateEventPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(eventSchema)
  });

  const onSubmit = async (data) => {
    try {
      await api.post('/events', data);
      toast.success('Akce byla vytvořena!');
      navigate('/my-events');
    } catch (error) {
      toast.error('Chyba při vytváření akce');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Formulářová pole */}
    </form>
  );
}
```

---

### 5. Moje rezervace s možností zrušení
**Popis:** Seznam rezervací uživatele s možností úprav.

**Frontend soubor:** `frontend/src/pages/MyReservationsPage.tsx`

**Funkce:**
- Seznam všech rezervací
- Barevné označení statusu (PENDING, CONFIRMED, CANCELLED)
- Detail rezervace
- Tlačítko "Zrušit rezervaci"
- Stažení QR kódu vstupenky

---

### 6. Admin panel pro reklamace
**Popis:** Správa všech reklamací s možností schvalování refundů.

**Frontend soubor:** `frontend/src/pages/AdminComplaintsPage.tsx`

**Funkce:**
- Seznam všech reklamací
- Filtry podle statusu
- Detail reklamace s informacemi o rezervaci
- Tlačítka: Schválit/Zamítnout
- Textové pole pro odpověď admina
- Checkbox pro automatickou refundaci

---

## 🚀 Pokročilé funkce

### 7. Upload obrázků akcí
**Backend:**
```typescript
import multer from 'multer';

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/events/upload-image', upload.single('image'), (req, res) => {
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});
```

---

### 8. Email notifikace
**Backend:** `backend/src/services/email.service.ts`

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendReservationConfirmation = async (
  email: string,
  reservation: any
) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Potvrzení rezervace',
    html: `
      <h1>Děkujeme za rezervaci!</h1>
      <p>Rezervační kód: ${reservation.reservationCode}</p>
      <p>Akce: ${reservation.event.title}</p>
      <p>Datum: ${new Date(reservation.event.startDate).toLocaleString('cs')}</p>
    `,
  });
};
```

**Volání po úspěšné platbě v webhook handleru.**

---

### 9. QR kódy pro vstupenky
```bash
npm install qrcode
```

```typescript
// backend/src/utils/qr.ts
import QRCode from 'qrcode';

export const generateTicketQR = async (reservationCode: string) => {
  return await QRCode.toDataURL(reservationCode);
};
```

---

### 10. Pokročilé vyhledávání a filtry
**Frontend:** Implementace faceted search

- Filtr podle ceny (slider)
- Filtr podle data (date picker)
- Řazení (nejnovější, nejlevnější, nejdříve)
- Full-text search

---

### 11. Hodnocení a recenze akcí
**Nový model v Prisma:**

```prisma
model Review {
  id        String   @id @default(uuid())
  eventId   String
  userId    String
  rating    Int      // 1-5
  comment   String?
  createdAt DateTime @default(now())
  
  event Event @relation(fields: [eventId], references: [id])
  user  User  @relation(fields: [userId], references: [id])
  
  @@map("reviews")
}
```

---

### 12. Sociální sdílení
**Frontend komponenta:**

```typescript
export function ShareButtons({ event }) {
  const shareUrl = `${window.location.origin}/events/${event.id}`;
  const text = `Podívejte se na tuto akci: ${event.title}`;

  return (
    <div>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}>
        Facebook
      </a>
      <a href={`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`}>
        Twitter
      </a>
      <button onClick={() => navigator.clipboard.writeText(shareUrl)}>
        Kopírovat odkaz
      </button>
    </div>
  );
}
```

---

### 13. Real-time aktualizace dostupnosti
**WebSocket implementace:**

```bash
npm install socket.io socket.io-client
```

**Backend:**
```typescript
import { Server } from 'socket.io';

const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN }
});

io.on('connection', (socket) => {
  socket.on('join-event', (eventId) => {
    socket.join(`event-${eventId}`);
  });
});

// Po vytvoření rezervace
io.to(`event-${eventId}`).emit('tickets-updated', { availableTickets });
```

---

### 14. Export statistik (CSV, PDF)
Pro organizátory - export dat o prodejích.

```bash
npm install pdfkit csv-writer
```

---

### 15. Multi-language support (i18n)
```bash
npm install react-i18next i18next
```

---

## 📝 Checklist implementace

Pro každou novou funkci:

- [ ] Navrhnout API endpoint (pokud potřeba)
- [ ] Implementovat backend logiku
- [ ] Aktualizovat Prisma schéma (pokud potřeba)
- [ ] Vytvořit/aktualizovat frontend komponenty
- [ ] Přidat validaci (Zod schema)
- [ ] Implementovat error handling
- [ ] Otestovat funkčnost
- [ ] Aktualizovat dokumentaci

---

## 🎨 UI/UX vylepšení

- Loading skeletons místo "Načítání..."
- Animated transitions
- Toast notifications pro všechny akce
- Confirm dialogy pro destruktivní akce
- Dark mode
- Accessibility (ARIA labels, keyboard navigation)

---

Doufám, že tento dokument pomůže při dalším vývoji aplikace! 🚀
