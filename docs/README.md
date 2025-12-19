# 📚 Dokumentace projektu

Kompletní dokumentace k projektu Webová aplikace pro rezervaci vstupenek na studentské akce.

> 📂 **[Přehled struktury projektu](STRUCTURE.md)** - Detailní popis adresářové struktury

## 📖 Obsah dokumentace

### 🚀 Getting Started - Pro začátečníky

Začněte zde, pokud chcete projekt rychle zprovoznit:

- **[Quick Start Guide](getting-started/README.md)** - Rychlý přehled možností spuštění
- **[Docker Setup](getting-started/docker.md)** - Spuštění s Dockerem (1 příkaz)
- **[Installation Guide](getting-started/installation.md)** - Detailní manuální instalace

---

### 👨‍💻 Development - Pro vývojáře

Dokumentace pro pochopení a vývoj aplikace:

- **[Architecture](development/architecture.md)** - Architektura aplikace, technologie, struktura
- **[API Documentation](development/api.md)** - REST API endpointy, autentizace, příklady
- **[Database Schema](development/database.md)** - Prisma schéma, relace, migrace
- **[Testing](development/testing.md)** - Unit, integration a performance testy
- **[Development Notes](development/notes.md)** - Poznámky k vývoji

---

### 🚀 Deployment - Pro produkci

Nasazení aplikace do produkčního prostředí:

- **[Deployment Guide](deployment/deployment.md)** - Railway + Vercel deployment, alternativy
- **[Production Checklist](deployment/production-checklist.md)** - Checklist před nasazením do produkce

---

### 📦 Project - Pro odevzdání/správu

Dokumentace pro odevzdání a správu projektu:

- **[Submission Guide](project/submission.md)** - Návod a checklist pro odevzdání bakalářky
- **[Implemented Features](project/implemented.md)** - Seznam implementovaných funkcí
- **[TODO & Future Features](project/todo.md)** - Plánované funkce a vylepšení

---

## 🗂️ Struktura dokumentace

```
docs/
├── README.md                           # Tento soubor - přehled dokumentace
│
├── getting-started/                    # 🚀 Pro začátečníky
│   ├── README.md                      # Quick start guide
│   ├── installation.md                # Detailní instalace
│   └── docker.md                      # Docker setup
│
├── development/                        # 👨‍💻 Pro vývojáře
│   ├── architecture.md                # Architektura
│   ├── api.md                         # API dokumentace
│   ├── database.md                    # Database schema
│   ├── testing.md                     # Testování
│   └── notes.md                       # Poznámky
│
├── deployment/                         # 🚀 Pro produkci
│   ├── deployment.md                  # Deployment návod
│   └── production-checklist.md        # Production checklist
│
└── project/                           # 📦 Pro správu projektu
    ├── submission.md                  # Odevzdání
    ├── implemented.md                 # Hotové funkce
    └── todo.md                        # TODO list
```

---

## 🔍 Rychlé odkazy

### Často používané

- [Jak spustit projekt?](getting-started/README.md)
- [Jak nasadit do produkce?](deployment/deployment.md)
- [Jaké jsou API endpointy?](development/api.md)
- [Jak funguje databáze?](development/database.md)
- [Jak spustit testy?](development/testing.md)

### Pro vedoucího bakalářky

- [Návod pro odevzdání](project/submission.md)
- [Co je implementováno](project/implemented.md)
- [Quick start s Dockerem](getting-started/docker.md)

---

## 📋 Konvence

Dokumentace je psána v češtině, kód a komentáře v angličtině (best practice).

**Formátování:**
- Markdown formát (.md)
- Code bloky s syntax highlighting
- Emoji pro lepší orientaci (📚 dokumentace, 🚀 deployment, 🐛 bug, ✅ hotovo, atd.)

**Aktualizace:**
- Při přidání nové funkce aktualizujte odpovídající dokumentaci
- Changelog je veden v Git commit history
- TODO list je v [project/todo.md](project/todo.md)

---

**Zpět na [hlavní README](../README.md)**
