# Backend Tests

Kompletní testovací sada pro backend aplikace.

## 📂 Struktura testů

```
backend/tests/
├── performance/        # Performance testy API endpointů
├── security/           # Security vulnerability testy
└── unit/              # Unit testy (aktuálně v src/__tests__)
```

## 🧪 Typy testů

### Unit Tests (56 testů)

Unit testy jsou umístěny v `src/__tests__/` a pokrývají:
- Controllers (user, event, booking, complaint)
- Middleware (auth, error handling)
- Utils funkce

**Spuštění:**
```bash
cd backend
npm test
```

**Coverage:**
```bash
cd backend
npm run test:coverage
```

### Performance Tests

Měří response time klíčových API endpointů.

**Spuštění:**
```bash
npm run test:api
```

**Testované endpointy:**
- Health check
- User registration/login
- Event listing/creation
- Booking creation
- Admin operations

**Thresholdy:**
- ✅ Excellent: < 100ms
- ⚠️ Acceptable: 100-500ms
- ❌ Slow: > 500ms

### Security Tests

Automatické bezpečnostní testy kontrolující:
- SQL injection prevence
- XSS protection
- CSRF tokens
- Authentication bypasses
- Rate limiting
- Security headers

**Spuštění:**
```bash
npm run test:security
```

## 📊 Test Coverage

Aktuální coverage (cíl: >80%):

| Category | Coverage |
|----------|----------|
| Controllers | 85%+ |
| Middleware | 90%+ |
| Routes | 80%+ |
| Overall | 85%+ |

## 🏃 Rychlé příkazy

```bash
# Všechny backend testy
cd backend && npm test

# Watch mode pro vývoj
cd backend && npm test -- --watch

# Pouze určitý soubor
cd backend && npm test user.controller.test.ts

# Performance + security testy
npm run test:api
npm run test:security
```

## ✅ CI/CD Integration

Testy se automaticky spouštějí při:
- Push do main branch
- Pull request
- Pre-commit hook (optional)

## 📝 Jak psát nové testy

### Unit test example:

```typescript
// src/__tests__/controllers/example.test.ts
import request from 'supertest';
import app from '../../index';

describe('Example Controller', () => {
  it('should return 200', async () => {
    const res = await request(app)
      .get('/api/example')
      .expect(200);
    
    expect(res.body).toHaveProperty('data');
  });
});
```

### Performance test example:

```javascript
// tests/performance/example.js
async function testExample() {
  const start = Date.now();
  const response = await fetch('http://localhost:3001/api/example');
  const duration = Date.now() - start;
  
  console.log(`Duration: ${duration}ms`);
}
```

## 🔍 Debugging testů

```bash
# Verbose mode
cd backend && npm test -- --verbose

# Pouze failed testy
cd backend && npm test -- --onlyFailures

# Debug v Node.js
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

**Pro více informací viz [dokumentace testování](../../docs/development/testing.md)**
