# Scripts

Utility skripty a konfigurace pro build, testování a deployment.

## 📂 Struktura

```
scripts/
└── lighthouse/              # Lighthouse CI konfigurace a výsledky
    ├── lighthouse.config.js # Konfigurace pro performance testy
    └── .lighthouseci/       # Výsledky Lighthouse testů
```

## 🔦 Lighthouse Performance Tests

Lighthouse CI automaticky testuje frontend performance při každém buildu.

**Spuštění:**
```bash
npm run test:lighthouse
```

**Co se testuje:**
- Performance score (cíl: >90)
- Accessibility (cíl: >90)
- Best Practices (cíl: >90)
- SEO (cíl: >90)

**Výsledky:**
- HTML reporty v `.lighthouseci/`
- JSON data pro CI/CD integrace

## 🔧 Přidání nových skriptů

Nové utility skripty přidávejte do této složky:

```bash
scripts/
├── lighthouse/
├── build/          # Build utility skripty
├── deploy/         # Deployment skripty
└── database/       # Database utility (migrace, seed, backup)
```

---

**Pro více informací viz [hlavní README](../README.md)**
