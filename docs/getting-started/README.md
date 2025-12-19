# 🚀 Getting Started

Vítejte v projektu Webová aplikace pro rezervaci vstupenek! Tento návod vás provede rychlým zprovozněním aplikace.

## Rychlé možnosti spuštění

### ⚡ Option 1: Docker (doporučeno - nejrychlejší)

Pokud máte nainstalovaný Docker Desktop, stačí jeden příkaz:

```bash
docker-compose up
```

Otevřete http://localhost:5173 a máte hotovo! 🎉

📖 **Detailní návod**: [docker.md](docker.md)

---

### 💻 Option 2: Manuální instalace

Pro vývoj nebo pokud nechcete Docker:

**Prerekvizity:**
- Node.js 18+
- PostgreSQL 14+
- npm nebo yarn
- Stripe účet (pro platby)

**Rychlý start:**
```bash
# 1. Nainstalujte závislosti
npm install

# 2. Nastavte databázi
cd backend
cp .env.example .env
# Upravte .env soubor

# 3. Spusťte migrace
npx prisma migrate dev
npx prisma db seed

# 4. Spusťte aplikaci
cd ..
npm run dev
```

📖 **Detailní návod**: [installation.md](installation.md)

---

## Testovací účty

Po spuštění aplikace můžete použít tyto předpřipravené účty:

| Role | Email | Heslo |
|------|-------|-------|
| 👑 Admin | admin@example.com | admin123 |
| 🎭 Organizátor | organizer@example.com | organizer123 |
| 👤 Uživatel | user@example.com | user123 |

---

## Co dál?

- 📚 [Architektura aplikace](../development/architecture.md)
- 🔌 [API dokumentace](../development/api.md)
- 🗄️ [Databázové schéma](../development/database.md)
- 🧪 [Testování](../development/testing.md)
- 🚀 [Deployment](../deployment/deployment.md)

---

## Potřebujete pomoc?

- 📖 Prohlédněte si [dokumentaci](../)
- 🐛 Našli jste problém? Zkontrolujte [troubleshooting v instalačním návodu](installation.md#řešení-problémů)
- 💬 Kontaktujte autora projektu
