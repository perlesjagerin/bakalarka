# API Dokumentace

## Base URL
```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Autentizace

Všechny chráněné endpointy vyžadují JWT token v Authorization headeru:
```
Authorization: Bearer <token>
```

**JWT Token:**
- Typ: Bearer token
- Expirace: 7 dní
- Obsahuje: `userId`, `email`, `role`

## Role-based Access Control

| Role | Oprávnění |
|------|-----------|
| **USER** | Prohlížení akcí, rezervace, reklamace |
| **ORGANIZER** | USER + Vytváření/správa vlastních akcí |
| **ADMIN** | Vše + správa všech akcí, uživatelů, reklamací |

---

## Auth Endpoints

### POST /auth/register
Registrace nového uživatele.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "heslo123",
  "firstName": "Jan",
  "lastName": "Novák",
  "role": "USER" // nebo "ORGANIZER"
}
```

**Response (201):**
```json
{
  "message": "Registrace úspěšná",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jan",
    "lastName": "Novák",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token"
}
```

### POST /auth/login
Přihlášení uživatele.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "heslo123"
}
```

**Response (200):**
```json
{
  "message": "Přihlášení úspěšné",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jan",
    "lastName": "Novák",
    "role": "USER"
  },
  "token": "jwt-token"
}
```

### GET /auth/me
Získání informací o přihlášeném uživateli.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jan",
    "lastName": "Novák",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Events Endpoints

### GET /events
Seznam všech publikovaných akcí (veřejné).

**Query Parameters:**
- `category` (optional): Filtrování podle kategorie
- `startDate` (optional): Akce od tohoto data
- `endDate` (optional): Akce do tohoto data
- `search` (optional): Vyhledávání v názvu a popisu

**Response (200):**
```json
{
  "events": [
    {
      "id": "uuid",
      "title": "Studentský ples",
      "description": "...",
      "location": "Praha",
      "startDate": "2024-03-15T19:00:00.000Z",
      "endDate": "2024-03-16T02:00:00.000Z",
      "category": "Večírek",
      "imageUrl": "https://...",
      "totalTickets": 200,
      "availableTickets": 150,
      "ticketPrice": 250,
      "status": "PUBLISHED",
      "organizer": {
        "id": "uuid",
        "firstName": "Marie",
        "lastName": "Nová"
      }
    }
  ],
  "count": 1
}
```

### GET /events/:id
Detail konkrétní akce (veřejné).

**Response (200):**
```json
{
  "event": {
    "id": "uuid",
    "title": "Studentský ples",
    "description": "...",
    "location": "Praha",
    "startDate": "2024-03-15T19:00:00.000Z",
    "endDate": "2024-03-16T02:00:00.000Z",
    "category": "Večírek",
    "imageUrl": "https://...",
    "totalTickets": 200,
    "availableTickets": 150,
    "ticketPrice": 250,
    "status": "PUBLISHED",
    "organizer": {
      "id": "uuid",
      "firstName": "Marie",
      "lastName": "Nová",
      "email": "organizer@example.com"
    }
  }
}
```

### POST /events
Vytvoření nové akce (vyžaduje roli ORGANIZER nebo ADMIN).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Koncert kapely XYZ",
  "description": "Skvělý koncert...",
  "location": "Brno",
  "startDate": "2024-05-10T20:00:00.000Z",
  "endDate": "2024-05-10T23:00:00.000Z",
  "category": "Koncert",
  "totalTickets": 100,
  "ticketPrice": 150,
  "imageUrl": "https://...",
  "status": "PUBLISHED"
}
```

**Response (201):**
```json
{
  "message": "Akce byla úspěšně vytvořena",
  "event": { /* ... */ }
}
```

### PUT /events/:id
Aktualizace akce (vyžaduje vlastnictví nebo ADMIN).

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (všechna pole jsou optional)
```json
{
  "title": "Nový název",
  "availableTickets": 80,
  "status": "CANCELLED"
}
```

**Response (200):**
```json
{
  "message": "Akce byla úspěšně aktualizována",
  "event": { /* ... */ }
}
```

### DELETE /events/:id
Zrušení akce (nastaví status na CANCELLED).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Akce byla úspěšně zrušena"
}
```

### GET /events/my/events
Seznam akcí přihlášeného organizátora.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "events": [ /* ... */ ],
  "count": 5
}
```

---

## Reservations Endpoints

### POST /reservations
Vytvoření nové rezervace.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "eventId": "uuid",
  "ticketCount": 2
}
```

**Response (201):**
```json
{
  "message": "Rezervace byla úspěšně vytvořena",
  "reservation": {
    "id": "uuid",
    "eventId": "uuid",
    "userId": "uuid",
    "ticketCount": 2,
    "totalAmount": 500,
    "status": "PENDING",
    "reservationCode": "ABC12345",
    "event": { /* ... */ }
  }
}
```

### GET /reservations/my
Seznam rezervací přihlášeného uživatele.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "reservations": [
    {
      "id": "uuid",
      "ticketCount": 2,
      "totalAmount": 500,
      "status": "CONFIRMED",
      "reservationCode": "ABC12345",
      "event": { /* ... */ },
      "payment": { /* ... */ }
    }
  ],
  "count": 3
}
```

### GET /reservations/:id
Detail rezervace.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "reservation": { /* ... */ }
}
```

### PUT /reservations/:id
Aktualizace rezervace (změna počtu vstupenek).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "ticketCount": 3
}
```

**Response (200):**
```json
{
  "message": "Rezervace byla úspěšně aktualizována",
  "reservation": { /* ... */ }
}
```

### DELETE /reservations/:id
Zrušení rezervace.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Rezervace byla úspěšně zrušena"
}
```

---

## Payments Endpoints

### POST /payments/create-payment-intent
Vytvoření platebního intentu pro Stripe.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reservationId": "uuid"
}
```

**Response (200):**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "payment": {
    "id": "uuid",
    "reservationId": "uuid",
    "amount": 500,
    "status": "PENDING"
  }
}
```

### POST /payments/webhook
Webhook pro Stripe události (bez autentizace, ověřeno Stripe signaturou).

### GET /payments/:paymentId/status
Kontrola statusu platby.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "payment": {
    "id": "uuid",
    "amount": 500,
    "status": "COMPLETED",
    "stripePaymentId": "pi_xxx",
    "paymentMethod": "card",
    "reservation": { /* ... */ }
  }
}
```

---

## Complaints Endpoints

### POST /complaints
Podání reklamace.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reservationId": "uuid",
  "reason": "Akce byla zrušena",
  "description": "Detailní popis problému..."
}
```

**Response (201):**
```json
{
  "message": "Reklamace byla úspěšně podána",
  "complaint": { /* ... */ }
}
```

### GET /complaints/my
Seznam reklamací přihlášeného uživatele.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "complaints": [ /* ... */ ],
  "count": 2
}
```

### GET /complaints
Seznam všech reklamací (pouze ADMIN).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filtrování podle statusu

**Response (200):**
```json
{
  "complaints": [ /* ... */ ],
  "count": 10
}
```

### PUT /complaints/:id/resolve
Vyřešení reklamace (pouze ADMIN).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "RESOLVED",
  "adminResponse": "Vaše reklamace byla vyřízena...",
  "shouldRefund": true
}
```

**Response (200):**
```json
{
  "message": "Reklamace byla úspěšně vyřešena",
  "complaint": {
    "id": "uuid",
    "status": "RESOLVED",
    "adminResponse": "...",
    "refundIssued": true,
    "resolvedAt": "2025-12-19T10:00:00.000Z"
  }
}
```

**Poznámka:** Pokud `shouldRefund: true`:
- Provede se Stripe refund
- Automaticky se vyřeší všechny ostatní reklamace na stejné rezervaci
- Nastaví se `refundIssued: true`

---

## Users Endpoints (Admin only)

### GET /users
Seznam všech uživatelů (pouze ADMIN).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Jan",
      "lastName": "Novák",
      "role": "USER",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 50
}
```

### DELETE /users/:id
Deaktivace/aktivace uživatele (pouze ADMIN, nelze měnit adminy).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Uživatel byl úspěšně deaktivován",
  "isActive": false
}
```

---

## Error Responses

Všechny endpointy mohou vrátit následující chybové odpovědi:

**401 Unauthorized:**
```json
{
  "message": "Uživatel není autentizován"
}
```

**403 Forbidden:**
```json
{
  "message": "Nemáte oprávnění k této akci"
}
```

**404 Not Found:**
```json
{
  "message": "Zdroj nebyl nalezen"
}
```

**400 Bad Request:**
```json
{
  "message": "Neplatná data v požadavku",
  "errors": ["Email je povinný", "Heslo musí mít alespoň 6 znaků"]
}
```

**500 Internal Server Error:**
```json
{
  "message": "Interní chyba serveru"
}
```

### POST /complaints/:id/resolve
Vyřešení reklamace s možností refundace (pouze ADMIN).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "adminResponse": "Platba byla vrácena.",
  "shouldRefund": true
}
```

**Response (200):**
```json
{
  "message": "Reklamace byla vyřešena"
}
```

---

## Error Responses

Všechny errory mají formát:
```json
{
  "error": "Chybová zpráva",
  "status": "error"
}
```

**HTTP Status Codes:**
- `400` - Bad Request (neplatná data)
- `401` - Unauthorized (chybějící/neplatný token)
- `403` - Forbidden (nedostatečná oprávnění)
- `404` - Not Found
- `500` - Internal Server Error
