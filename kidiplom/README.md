# Bakalářská práce - LaTeX dokumentace

Tato složka obsahuje zdrojové soubory a výstup bakalářské práce.

## 📄 Hlavní soubory

- **`kidiplom.pdf`** - ✅ **Finální PDF bakalářky** (25 stran)
- **`kidiplom.tex`** - Zdrojový LaTeX soubor
- **`bibliografie.bib`** - Literatura a zdroje

## 📊 Diagramy

Všechny diagramy jsou v **PlantUML formátu** (`.puml`) a vygenerované PNG jsou v složce `graphics/`.

### Dostupné diagramy:
- **`architecture.puml`** - Architektura systému (3-vrstvá)
- **`auth-flow.puml`** - Autentizační flow (JWT)
- **`database-model.puml`** - Databázový model (5 entit)
- **`reservation-flow.puml`** - Sekvenční diagram rezervace
- **`reservation-states.puml`** - Stavový diagram rezervace (5 stavů)
- **`usecase.puml`** - Use case diagram
- **`class-diagram.puml`** - Zjednodušený class diagram
- **`class-diagram-detailed.puml`** - Detailní class diagram

## 🖼️ Obrázky

Složka **`graphics/`** obsahuje:
- Všechny vygenerované PNG diagramy
- Logo univerzity (`UP_znak*.pdf/ps`)
- Titulní strany (`kititle-*.pdf/ps`)

## 🔧 Kompilace

### Prerekvizity
- LaTeX distribuce (např. BasicTeX, TeX Live)
- PlantUML (pro regeneraci diagramů)

### Postup

1. **Regenerace diagramů** (pokud měníš `.puml` soubory):
```bash
plantuml -tpng *.puml
```

2. **Kompilace PDF** (2x pro cross-reference):
```bash
pdflatex -interaction=nonstopmode kidiplom.tex
pdflatex -interaction=nonstopmode kidiplom.tex
```

## 📐 Formátování

- **Šablona:** kidiplom.cls (Univerzita Palackého)
- **Styl:** ISO 690 bibliografie (numeric)
- **Jazyk:** Čeština
- **Velikost:** A4, 12pt
- **Diagramy:** PlantUML s `linetype polyline` (hranaté šipky)

## 🗂️ Struktura práce

1. **Úvod** - Motivace a cíle
2. **Analýza** - Požadavky, role, use cases
3. **Návrh** - Architektura, databáze, diagramy
4. **Implementace** - Technologie, řešení, procesy
5. **Testování** - Unit, E2E, pokrytí
6. **Závěr** - Shrnutí a hodnocení

## 📋 Pomocné soubory

- **`kidiplom.cls`** - Třída dokumentu
- **`kibase.sty`** - Základní balíček
- **`czech.lbx`, `slovak.lbx`** - Lokalizace
- **`iso*.bbx/cbx`** - Bibliografické styly
- **`kidiplom-template.tex`** - Šablona (nepoužito)

## 🧹 Ignorované soubory

LaTeX generuje pomocné soubory během kompilace (`.aux`, `.log`, `.toc`, atd.). 
Tyto jsou pravidelně mazány a **nejsou** commitovány do Gitu.

---

**Vytvořeno:** prosinec 2024  
**Finální verze:** 25 stran, 5 hlavních diagramů, CONFIRMED status implementován
