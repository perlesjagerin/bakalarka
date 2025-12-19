# Performance Tests

Tento adresář obsahuje nástroje pro testování výkonu aplikace.

## 📋 Obsah

- `api-performance.js` - Test rychlosti Backend API endpointů
- `lighthouse.config.js` - Konfigurace pro Lighthouse CI (Frontend performance)

## 🚀 Spuštění testů

### Backend API Performance Test

Testuje response time jednotlivých API endpointů.

```bash
npm run test:api
```

**Co testuje:**
- GET /api/events (cíl: < 200ms)
- GET /api/events/:id (cíl: < 200ms)
- POST /api/auth/login (cíl: < 300ms)

**Požadavky:**
- Backend musí běžet na http://localhost:3001

---

### Frontend Performance Test (Lighthouse)

Testuje výkon, SEO a přístupnost frontend aplikace.

```bash
npm run test:lighthouse
```

**Co testuje:**
- First Contentful Paint (FCP) < 1.5s
- Time to Interactive (TTI) < 3.5s
- Performance Score > 90
- Accessibility Score > 90
- SEO Score > 90

**Požadavky:**
- Frontend production build (`cd frontend && npm run build`)
- Port 4173 musí být volný

---

## 📊 Výsledky

### API Performance Test
Vytiskne výsledky přímo v terminálu s barevným označením:
- 🟢 **Zelená** = pod threshold (výborné)
- 🟡 **Žlutá** = mírně nad threshold (přijatelné)
- 🔴 **Červená** = výrazně nad threshold (vyžaduje optimalizaci)

### Lighthouse Test
Výsledky jsou uloženy v `.lighthouseci/` a také uploadnuty na temporary-public-storage.

---

## 🔧 Konfigurace

### Změna thresholdů API testů
Edituj `api-performance.js`:
```javascript
testEndpoint('Endpoint name', url, options, THRESHOLD_MS);
```

### Změna Lighthouse assertionů
Edituj `lighthouse.config.js`:
```javascript
assertions: {
  'first-contentful-paint': ['warn', { maxNumericValue: 1500 }],
  // ...
}
```

---

## 💡 Tipy pro optimalizaci

### Pokud API testy failují:
- ✅ Přidej indexy do databáze
- ✅ Optimalizuj Prisma queries (select pouze potřebná pole)
- ✅ Použij connection pooling
- ✅ Zvažuj caching (Redis)

### Pokud Lighthouse testy failují:
- ✅ Minimalizuj JavaScript bundle (code splitting)
- ✅ Optimalizuj obrázky (WebP, lazy loading)
- ✅ Použij CDN pro static assets
- ✅ Přidej Service Worker pro caching
