# Cleanup skript pro testovací data

## Problém
Testovací uživatelé a události se dříve vytvářely v **produkční databázi** místo testovací.

## Řešení

### 1. Automatický cleanup po testech
Testy nyní:
- ✅ Vždy běží proti **testovací databázi** `ticket_reservation_test`
- ✅ Automaticky mažou testovací data po dokončení každého test suite
- ✅ Kontrolují, že nikdy nepoužijí produkční databázi

### 2. Manuální cleanup produkční databáze
Pro vyčištění testovacích uživatelů z produkční databáze:

```bash
cd backend
npm run cleanup:test-users
```

Tento skript:
- Najde všechny testovací uživatele (email obsahuje: `test`, `events`, `example` nebo končí `.test.com`/`.example.com`)
- Zobrazí seznam nalezených uživatelů
- Vyžádá potvrzení před smazáním
- Smaže uživatele a všechna jejich data (v správném pořadí kvůli foreign keys)

### 3. Rozpoznávání testovacích dat
Testovací data jsou rozpoznána podle emailu:
- Obsahuje slovo `test` → např. `user.test@example.com`
- Obsahuje slovo `events` → např. `organizer.events.123@test.com`
- Obsahuje slovo `example` → např. `user@example.com`
- Končí na `@test.com` → testovací doména
- Končí na `@example.com` → testovací doména

### 4. Jak spouštět testy správně

**✅ SPRÁVNĚ:**
```bash
npm test                    # Použije testovací databázi
npm run test:watch          # Watch mode s testovací DB
npm run test:coverage       # Coverage s testovací DB
```

**❌ ŠPATNĚ:**
```bash
jest                        # Může použít produkční DB!
DATABASE_URL=... npm test   # Nebezpečné!
```

### 5. Bezpečnostní kontroly

#### Test setup (`src/__tests__/setup.ts`)
- Kontroluje, že `DATABASE_URL` obsahuje `_test`
- Pokud ne, ukončí testy s chybou
- Tím zabrání náhodnému použití produkční databáze

#### Package.json skripty
- Všechny test skripty explicitně nastavují `DATABASE_URL` na testovací databázi
- `NODE_ENV=test` je vždy nastaveno

## Pořadí mazání (důležité kvůli foreign keys)

1. **Complaints** (stížnosti) - nemají závislosti na jiných tabulkách
2. **Payments** (platby) - závisí na Reservations
3. **Reservations** (rezervace) - závisí na Users a Events
4. **Events** (události) - závisí na Users (organizerId)
5. **Users** (uživatelé) - mohou být smazáni jako poslední

## Struktura testovací databáze

### Produkční databáze
- **Název:** `ticket_reservation`
- **Použití:** Běžící aplikace (`npm run dev`)
- **Data:** Reálná data, nikdy nejsou automaticky mazána

### Testovací databáze  
- **Název:** `ticket_reservation_test`
- **Použití:** Automatické testy (`npm test`)
- **Data:** Testovací data, automaticky mazána po každém testu

## Co dělat pokud...

### V produkční DB jsou testovací uživatelé
```bash
npm run cleanup:test-users
```

### Testy hlásí chybu s databází
1. Ověř, že testovací databáze existuje:
   ```bash
   psql -U I751134 -l | grep ticket_reservation_test
   ```

2. Pokud neexistuje, vytvoř ji:
   ```bash
   psql -U I751134 -c "CREATE DATABASE ticket_reservation_test;"
   ```

3. Aplikuj migrace:
   ```bash
   DATABASE_URL="postgresql://I751134@localhost:5432/ticket_reservation_test?schema=public" npx prisma migrate deploy
   ```

### Chceš resetovat testovací databázi
```bash
psql -U I751134 -c "DROP DATABASE ticket_reservation_test;"
psql -U I751134 -c "CREATE DATABASE ticket_reservation_test;"
DATABASE_URL="postgresql://I751134@localhost:5432/ticket_reservation_test?schema=public" npx prisma migrate deploy
```
