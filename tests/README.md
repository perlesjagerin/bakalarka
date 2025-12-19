# E2E Testy - Playwright

## Přehled

Tento projekt používá **Playwright** pro end-to-end testování. Testy ověřují kritické user flows aplikace.

## Testované scénáře

### 1. **Authentication Flow** (`auth.spec.ts`)
- ✅ Registrace nového uživatele
- ✅ Přihlášení s registrovaným uživatelem
- ✅ Chybová hlášení pro neplatné přihlašovací údaje
- ✅ Odhlášení
- ✅ Validace duplicitních emailů
- ✅ Validace požadavků na heslo

### 2. **Create Event Flow** (`create-event.spec.ts`)
- ✅ Vytvoření nové události
- ✅ Zobrazení vytvořené události v "Moje události"
- ✅ Validace povinných polí
- ✅ Editace existující události
- ✅ Zrušení události

### 3. **Reservation Flow** (`reservation.spec.ts`)
- ✅ Procházení a zobrazení detailu události
- ✅ Vytvoření rezervace
- ✅ Zobrazení mých rezervací
- ✅ Zrušení rezervace
- ✅ Filtrování událostí podle kategorie
- ✅ Vyhledávání událostí

## Spuštění testů

### Předpoklady
- Backend musí běžet na `http://localhost:3001`
- Frontend musí běžet na `http://localhost:5173`
- Databáze musí být připravena

**Playwright automaticky spustí dev servery**, pokud nejsou spuštěné.

### Spuštění všech testů

```bash
# Headless mode (bez UI)
npx playwright test

# S UI (pro debugging)
npx playwright test --ui

# Konkrétní test
npx playwright test tests/auth.spec.ts

# S vizualizací prohlížeče
npx playwright test --headed
```

### Debugging testů

```bash
# Spustit v debug módu
npx playwright test --debug

# Zobrazit report
npx playwright show-report
```

## Struktura testů

```
tests/
├── auth.spec.ts              # Testy autentizace
├── create-event.spec.ts      # Testy vytváření událostí
├── reservation.spec.ts       # Testy rezervací
└── helpers/
    ├── auth-helpers.ts       # Pomocné funkce pro auth
    └── test-users.ts         # Testovací data
```

## Testovací data

Testy používají dynamicky generované uživatele s unikátními emaily (timestamp).
Není potřeba manuálně vytvářet testovací uživatele.

## Data-testid atributy

Pro lepší testovatelnost jsou v komponentách přidány `data-testid` atributy:

- `data-testid="user-menu"` - Uživatelské menu
- `data-testid="logout-button"` - Tlačítko odhlášení
- `data-testid="event-card"` - Karta události
- `data-testid="reserve-button"` - Tlačítko rezervace
- `data-testid="reservations-list"` - Seznam rezervací
- `data-testid="cancel-reservation"` - Tlačítko zrušení rezervace

## Poznámky

- Testy běží seriálně v rámci každé suite, aby se předešlo konfliktům
- Používá se pouze Chromium browser pro rychlost
- Testy vytváří a čistí svá vlastní data
- Při spuštění v CI prostředí se testy automaticky konfigurují pro produkční prostředí

## Troubleshooting

### Testy selhávají kvůli timeoutu
```bash
# Zvyš timeout v playwright.config.ts nebo konkrétním testu
test.setTimeout(60000); // 60 sekund
```

### Databáze je zaplněna testovacími daty
Vytvoř skript pro čištění testovacích uživatelů:
```sql
DELETE FROM users WHERE email LIKE 'test.%@example.com';
```

### Testy selhávají na selektorech
Zkontroluj, že komponenty mají správné `data-testid` atributy.
