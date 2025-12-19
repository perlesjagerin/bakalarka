# 🚀 Rychlé spuštění s Dockerem

Tento návod je určen pro rychlé zprovoznění celé aplikace pomocí Dockeru.

## Prerekvizity

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) nainstalovaný a spuštěný
- To je vše! ✅

## Spuštění (3 kroky)

### 1. Stažení projektu

```bash
# Pokud máte Git:
git clone https://github.com/username/your-repo.git
cd your-repo

# Nebo rozbalte ZIP archiv a přejděte do složky
```

### 2. Spuštění aplikace

```bash
docker-compose up
```

**První spuštění trvá ~5-10 minut** (stahování images, instalace závislostí).  
Další spuštění jsou rychlejší (~30 sekund).

### 3. Otevření aplikace

Počkejte, dokud neuvidíte:
```
ticket-backend  | Server running on port 3001
ticket-frontend | Local: http://localhost:5173/
```

Poté otevřete: **http://localhost:5173**

## 🎉 Hotovo!

Aplikace běží s:
- ✅ Frontend: http://localhost:5173
- ✅ Backend API: http://localhost:3001
- ✅ PostgreSQL databáze (automaticky nastavena)
- ✅ Testovací data (seed data)

### Testovací účty

- **Admin**: `admin@example.com` / `admin123`
- **Organizátor**: `organizer@example.com` / `organizer123`
- **Uživatel**: `user@example.com` / `user123`

## Zastavení aplikace

```bash
# Ctrl+C v terminálu

# Nebo v novém terminálu:
docker-compose down

# Smazat databázi a začít znovu:
docker-compose down -v
```

## Řešení problémů

### Port již používán
```bash
# Pokud port 5173, 3001 nebo 5432 již používá jiná aplikace:

# Zastavte Docker
docker-compose down

# Najděte a ukončete proces:
lsof -i :5173  # Frontend
lsof -i :3001  # Backend
lsof -i :5432  # PostgreSQL

# Spusťte znovu
docker-compose up
```

### Build error
```bash
# Vyčistit a rebuildit:
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Databáze se neinicializuje
```bash
# Restart s vyčištěním:
docker-compose down -v
docker-compose up
```

## Pokročilé použití

### Spuštění na pozadí
```bash
docker-compose up -d

# Zobrazení logů:
docker-compose logs -f

# Zastavení:
docker-compose down
```

### Přístup do databáze
```bash
docker exec -it ticket-db psql -U postgres -d ticket_reservation
```

### Rebuild po změnách kódu
```bash
docker-compose down
docker-compose build
docker-compose up
```

---

**Pro detailní dokumentaci a lokální spuštění bez Dockeru viz [installation.md](installation.md)**
