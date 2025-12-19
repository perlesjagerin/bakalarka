# Automated Tests

Automatizované testy pro backend a frontend aplikace.

## 📁 Struktura

```
bakalarka/
├── backend/
│   ├── src/__tests__/
│   │   ├── auth.test.ts       # Testy autentizace
│   │   ├── events.test.ts     # Testy správy akcí
│   │   └── setup.ts           # Test setup
│   └── jest.config.js         # Jest konfigurace
├── frontend/
│   ├── src/
│   │   ├── components/__tests__/
│   │   │   └── EventCard.test.tsx  # Component testy
│   │   └── test/
│   │       └── setup.ts            # Vitest setup
│   └── vitest.config.ts       # Vitest konfigurace
```

---

## 🧪 Backend Testy (Jest + Supertest)

### Instalace závislostí

```bash
cd backend
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

### Spuštění testů

```bash
# Z root složky
npm run test --workspace=backend

# Nebo přímo v backend složce
cd backend
npm test

# Watch mode (automatické spouštění při změnách)
npm run test:watch

# S coverage reportem
npm run test:coverage
```

### Co testujeme

#### Auth Tests (`auth.test.ts`)
- ✅ Registrace nového uživatele
- ✅ Registrace s existujícím emailem (měla by selhat)
- ✅ Registrace bez povinných polí
- ✅ Registrace s neplatným emailem
- ✅ Přihlášení se správnými údaji
- ✅ Přihlášení se špatnými údaji
- ✅ GET /auth/me s platným tokenem
- ✅ GET /auth/me bez tokenu
- ✅ GET /auth/me s neplatným tokenem

#### Events Tests (`events.test.ts`)
- ✅ Získání všech publikovaných akcí
- ✅ Filtrování podle kategorie
- ✅ Vytvoření akce jako organizátor
- ✅ Zakázání vytvoření akce jako běžný uživatel
- ✅ Detail akce podle ID
- ✅ 404 pro neexistující akci
- ✅ Úprava vlastní akce
- ✅ Zakázání úpravy cizí akce

---

## 🎨 Frontend Testy (Vitest + React Testing Library)

### Instalace závislostí

```bash
cd frontend
npm install --save-dev vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Spuštění testů

```bash
# Z root složky
npm run test --workspace=frontend

# Nebo přímo ve frontend složce
cd frontend
npm test

# Watch mode
npm run test:watch

# UI mode (interaktivní prohlížeč)
npm run test:ui

# S coverage
npm run test:coverage
```

### Co testujeme

#### EventCard Component (`EventCard.test.tsx`)
- ✅ Vykreslení názvu akce
- ✅ Vykreslení popisu
- ✅ Vykreslení lokace
- ✅ Vykreslení kategorie badge
- ✅ Zobrazení dostupnosti lístků
- ✅ Zobrazení ceny
- ✅ Zobrazení "Zadarmo" pro free events
- ✅ Vykreslení tlačítka "Zobrazit detail"
- ✅ Vykreslení obrázku akce
- ✅ Správný link na detail

---

## 📊 Test Coverage

Po spuštění `npm run test:coverage` se vygeneruje složka `coverage/` s HTML reportem:

```bash
# Backend
open backend/coverage/lcov-report/index.html

# Frontend
open frontend/coverage/index.html
```

**Cílové pokrytí:**
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

---

## 🔧 Konfigurace

### Backend (Jest)

**jest.config.js:**
- Test environment: Node.js
- TypeScript support: ts-jest
- Test match: `**/__tests__/**/*.test.ts`
- Setup file: `setup.ts`
- Timeout: 30 sekund (pro databázové operace)

### Frontend (Vitest)

**vitest.config.ts:**
- Test environment: jsdom (simuluje browser)
- Setup file: `src/test/setup.ts`
- CSS support: enabled
- React plugin: enabled

---

## 🚀 CI/CD Integration

Pro automatické spouštění testů v CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: ticket_reservation_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run backend tests
        run: npm run test --workspace=backend
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ticket_reservation_test
      
      - name: Run frontend tests
        run: npm run test --workspace=frontend
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 📝 Psaní nových testů

### Backend Test Template

```typescript
import request from 'supertest';
import app from '../index';

describe('Your Feature', () => {
  it('should do something', async () => {
    const res = await request(app)
      .get('/api/endpoint')
      .set('Authorization', 'Bearer token');
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
});
```

### Frontend Test Template

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import YourComponent from '../YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Some text')).toBeInTheDocument();
  });
});
```

---

## 🐛 Troubleshooting

### Backend testy selhávají

**Problém:** Database connection errors

**Řešení:**
```bash
# Ujisti se, že máš test databázi
psql -U postgres
CREATE DATABASE ticket_reservation_test;
\q

# Spusť migrace
cd backend
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ticket_reservation_test" npx prisma migrate deploy
```

### Frontend testy selhávají

**Problém:** Module not found

**Řešení:**
```bash
cd frontend
npm install
npm run test
```

---

## 📚 Další zdroje

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

---

## ✅ Test Checklist

Před každým release:

- [ ] Všechny unit testy proběhly ✅
- [ ] Coverage > 80%
- [ ] Integration testy proběhly ✅
- [ ] E2E testy proběhly ✅
- [ ] Performance testy OK
- [ ] Security testy OK
- [ ] Všechny CI/CD pipeline jobs zelené
