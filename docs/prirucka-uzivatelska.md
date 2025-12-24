# Uživatelská příručka
## Rezervační systém pro studentské akce

---

## 1. Úvod

Vítejte v rezervačním systému pro studentské akce! Tato příručka vás provede všemi funkcemi aplikace a naučí vás, jak ji efektivně používat.

### 1.1 Co aplikace umožňuje?

- 📅 Prohlížení a rezervace vstupenek na studentské akce
- 💳 Bezpečné platby přes Stripe
- 🎫 Stažení PDF vstupenek s QR kódem
- 📧 Automatické emailové notifikace
- 👤 Správa vašich rezervací
- 🎪 Vytváření vlastních akcí (pro organizátory)
- 🛡️ Administrace systému (pro administrátory)

### 1.2 Systémové požadavky

- Moderní webový prohlížeč (Chrome, Firefox, Safari, Edge)
- Internetové připojení
- Platný emailová adresa

---

## 2. První kroky

### 2.1 Registrace

1. Otevřete aplikaci v prohlížeči
2. Klikněte na **"Registrovat se"**
3. Vyplňte registrační formulář:
   - Email (bude váš přihlašovací login)
   - Heslo (min. 6 znaků)
   - Jméno
   - Příjmení
4. Klikněte na **"Vytvořit účet"**
5. Obdržíte uvítací email s potvrzením registrace

### 2.2 Přihlášení

1. Na hlavní stránce klikněte na **"Přihlásit se"**
2. Zadejte svůj email a heslo
3. Klikněte na **"Přihlásit"**

Budete automaticky přesměrováni na domovskou stránku s akcemi.

---

## 3. Prohlížení a vyhledávání akcí

### 3.1 Prohlížení akcí

Na hlavní stránce vidíte seznam všech dostupných akcí. Každá karta akce obsahuje:
- Název akce
- Datum a čas konání
- Místo konání
- Kategorie
- Cena vstupenky
- Počet dostupných vstupenek

### 3.2 Filtrování podle kategorie

V horní části stránky najdete tlačítka s kategoriemi:
- 🎵 **Hudba** - koncerty, festivaly
- 🎭 **Divadlo** - divadelní představení
- 🎬 **Film** - filmové projekce
- ⚽ **Sport** - sportovní akce
- 💻 **Technologie** - tech meetupy, hackathony
- 📚 **Vzdělávání** - přednášky, workshopy
- 🎨 **Jiné** - ostatní akce

Kliknutím na kategorii se zobrazí pouze akce dané kategorie. Pro zobrazení všech klikněte na **"Vše"**.

### 3.3 Vyhledávání

1. Do vyhledávacího pole nahoře zadejte název akce
2. Výsledky se automaticky filtrují podle vašeho zadání

### 3.4 Detail akce

1. Klikněte na kartu akce
2. Zobrazí se detail s:
   - Úplným popisem
   - Obrázkem (pokud je k dispozici)
   - Informacemi o organizátorovi
   - Tlačítkem pro rezervaci

---

## 4. Rezervace vstupenek

### 4.1 Vytvoření rezervace

1. Na detailu akce klikněte na **"Rezervovat vstupenky"**
2. Vyberte počet vstupenek (max. 10 ks)
3. Zkontrolujte celkovou cenu
4. Klikněte na **"Potvrdit rezervaci"**

### 4.2 Platba kartou (placené akce)

Pokud je akce placená, pokračujte platbou:

1. Otevře se platební formulář Stripe
2. Zadejte údaje platební karty:
   - Číslo karty
   - Datum expirace (MM/RR)
   - CVC kód
3. Klikněte na **"Zaplatit"**

**Testovací karta pro demo:**
- Číslo: `4242 4242 4242 4242`
- Datum: jakékoli budoucí
- CVC: jakékoli 3 číslice

### 4.3 Akce zdarma

Pokud je akce zdarma (cena 0 Kč):
- Rezervace se potvrdí okamžitě bez platby
- Vstupenka je dostupná ke stažení hned

### 4.4 Potvrzení

Po úspěšné platbě:
1. Zobrazí se potvrzovací zpráva
2. Obdržíte email s potvrzením
3. Budete přesměrováni na **"Moje rezervace"**

---

## 5. Správa rezervací

### 5.1 Zobrazení rezervací

1. V menu klikněte na **"Moje rezervace"**
2. Zobrazí se seznam všech vašich rezervací s:
   - Názvem akce
   - Datem konání
   - Počtem vstupenek
   - Celkovou cenou
   - Stavem (Čeká na platbu, Zaplaceno, Zrušeno)
   - Rezervačním kódem

### 5.2 Stavy rezervací

- 🟡 **Čeká na platbu** - rezervace vytvořena, čeká se na dokončení platby
- 🟢 **Zaplaceno** - platba úspěšná, vstupenka aktivní
- 🔴 **Zrušeno** - rezervace zrušena
- 💰 **Refundováno** - rezervace zrušena a peníze vráceny

### 5.3 Stažení PDF vstupenky

1. U rezervace se stavem **"Zaplaceno"** klikněte na **"Stáhnout vstupenku"**
2. Stáhne se PDF soubor s názvem `vstupenka-XXXXXXXX.pdf`

**Vstupenka obsahuje:**
- QR kód (pro skenování při vstupu)
- Detaily akce (název, datum, místo)
- Vaše jméno
- Počet vstupenek
- Rezervační kód

### 5.4 Zrušení rezervace

1. U aktivní rezervace klikněte na **"Zrušit rezervaci"**
2. Potvrďte zrušení
3. Systém automaticky:
   - Vrátí vstupenky do eventu
   - Spustí refundaci přes Stripe (pokud byla platba)
   - Odešle email s potvrzením
   - Změní stav na **"Refundováno"**

**Poznámka:** Refundace může trvat 5-10 pracovních dní podle vaší banky.

---

## 6. Reklamace

### 6.1 Podání reklamace

Pokud máte problém s rezervací nebo akcí:

1. V **"Moje rezervace"** najděte příslušnou rezervaci
2. Klikněte na **"Podat reklamaci"**
3. Vyplňte formulář:
   - Důvod reklamace (výběr z možností)
   - Podrobný popis problému
4. Klikněte na **"Odeslat reklamaci"**

### 6.2 Sledování stavu reklamace

1. V menu klikněte na **"Moje reklamace"**
2. Zobrazí se seznam všech vašich reklamací

**Stavy reklamace:**
- 📝 **Podáno** - reklamace byla vytvořena
- 🔍 **V řešení** - administrátor reklamaci řeší
- ✅ **Vyřízeno** - reklamace schválena, proběhla refundace
- ❌ **Zamítnuto** - reklamace zamítnuta

### 6.3 Odpověď na reklamaci

Po vyřízení obdržíte:
- Email s odpovědí administrátora
- V případě schválení automatickou refundaci

---

## 7. Funkce pro organizátory

Pokud máte roli **Organizátor**, máte přístup k dalším funkcím.

### 7.1 Vytvoření akce

1. V menu klikněte na **"Moje akce"**
2. Klikněte na **"Vytvořit novou akci"**
3. Vyplňte formulář:
   - **Název** - název akce
   - **Popis** - podrobný popis (podporuje formátování)
   - **Místo konání** - adresa nebo název místa
   - **Datum začátku** - datum a čas začátku
   - **Datum konce** - datum a čas konce
   - **Kategorie** - výběr z kategorií
   - **Obrázek URL** - odkaz na obrázek (nepovinné)
   - **Celkový počet vstupenek** - kapacita akce
   - **Cena vstupenky** - cena v Kč (0 pro akce zdarma)
4. Klikněte na **"Vytvořit akci"**

Akce je vytvořena ve stavu **"Koncept"** a není veřejně viditelná.

### 7.2 Úprava akce

1. V seznamu **"Moje akce"** najděte akci
2. Klikněte na **"Upravit"**
3. Změňte potřebné údaje
4. Klikněte na **"Uložit změny"**

**Poznámka:** Některé údaje nelze měnit, pokud již existují rezervace.

### 7.3 Publikování akce

1. U akce ve stavu **"Koncept"** klikněte na **"Publikovat"**
2. Akce se změní na stav **"Publikováno"** a bude viditelná všem uživatelům

### 7.4 Zrušení akce

1. U publikované akce klikněte na **"Zrušit akci"**
2. Potvrďte zrušení
3. Systém automaticky:
   - Změní stav na **"Zrušeno"**
   - Zruší všechny aktivní rezervace
   - Provede refundace
   - Odešle emaily všem účastníkům

### 7.5 Zobrazení statistik

1. U akce klikněte na **"Zobrazit statistiky"**
2. Zobrazí se:
   - Celkový počet rezervací
   - Počet prodaných vstupenek
   - Celková výše tržeb
   - Obsazenost v %

### 7.6 Rezervace na akci

1. U akce klikněte na **"Zobrazit rezervace"**
2. Zobrazí se seznam všech rezervací s:
   - Jménem zákazníka
   - Emailem
   - Počtem vstupenek
   - Stavem
   - Rezervačním kódem

**Použití:** Při vstupu na akci ověřte QR kód nebo rezervační kód zákazníka.

---

## 8. Funkce pro administrátory

Pokud máte roli **Administrátor**, máte plný přístup k systému.

### 8.1 Dashboard

1. V menu klikněte na **"Dashboard"**
2. Zobrazí se celkové statistiky:
   - Počet uživatelů podle rolí
   - Počet akcí podle stavů
   - Počet rezervací
   - Počet nevyřízených reklamací

### 8.2 Správa uživatelů

1. V menu klikněte na **"Uživatelé"**
2. Zobrazí se seznam všech uživatelů

**Možné akce:**
- **Filtrovat podle role** - zobrazit pouze určitou roli
- **Aktivovat/Deaktivovat účet** - zablokovat nebo odblokovat uživatele
- **Zobrazit detail** - zobrazit všechny informace o uživateli

**Poznámka:** Administrátorské účty nelze deaktivovat (ochrana).

### 8.3 Správa všech akcí

1. V menu klikněte na **"Všechny akce"**
2. Zobrazí se akce od všech organizátorů

**Možné akce:**
- Upravit jakoukoliv akci
- Smazat akci (pokud nemá rezervace)
- Zrušit akci

### 8.4 Vyřizování reklamací

1. V menu klikněte na **"Reklamace"**
2. Zobrazí se seznam všech reklamací

**Stavy:**
- 📝 **Podáno** - nová reklamace k vyřízení
- 🔍 **V řešení** - označte při zahájení řešení
- ✅ **Vyřízeno** - schválit reklamaci
- ❌ **Zamítnuto** - zamítnout reklamaci

**Postup vyřízení:**
1. Klikněte na reklamaci pro zobrazení detailu
2. Přečtěte si důvod a popis
3. Případně změňte stav na **"V řešení"**
4. Napište odpověď pro zákazníka
5. Vyberte finální stav:
   - **"Vyřízeno"** - provede se automatická refundace
   - **"Zamítnuto"** - bez refundace
6. Klikněte na **"Uložit"**

Zákazník obdrží email s vaší odpovědí.

---

## 9. Profil a nastavení

### 9.1 Zobrazení profilu

1. V pravém horním rohu klikněte na ikonu profilu
2. Klikněte na **"Profil"**

Zobrazí se vaše údaje:
- Jméno a příjmení
- Email
- Role
- Datum registrace

### 9.2 Odhlášení

1. Klikněte na ikonu profilu v pravém horním rohu
2. Klikněte na **"Odhlásit se"**

---

## 10. Časté dotazy (FAQ)

### Q: Mohu změnit počet vstupenek po rezervaci?
A: Ne, pro změnu počtu vstupenek musíte rezervaci zrušit a vytvořit novou.

### Q: Jak dlouho trvá vrácení peněz?
A: Refundace je zpracována okamžitě přes Stripe, ale vrácení na váš účet může trvat 5-10 pracovních dní podle vaší banky.

### Q: Mohu rezervovat více než 10 vstupenek?
A: Ne, maximum je 10 vstupenek na jednu rezervaci. Pro větší počet vytvořte více rezervací.

### Q: Co se stane, když organizátor zruší akci?
A: Obdržíte email s informací, všechny peníze budou automaticky vráceny.

### Q: Mohu se stát organizátorem?
A: Ano, kontaktujte administrátora s žádostí o změnu role na organizátor.

### Q: Kde najdu své vstupenky?
A: V sekci "Moje rezervace" u každé zaplacené rezervace je tlačítko "Stáhnout vstupenku".

### Q: Co když zapomenu heslo?
A: Momentálně systém nemá funkci obnovy hesla. Kontaktujte administrátora.

### Q: Jsou moje platební údaje v bezpečí?
A: Ano, platby jsou zpracovávány přes Stripe, který je PCI DSS certifikovaný. Aplikace neukládá platební karty.

---

## 11. Podpora a kontakt

### Technická podpora

Pokud narazíte na problém nebo máte dotaz:
1. Zkontrolujte tuto příručku
2. Podívejte se do sekce FAQ
3. Kontaktujte administrátora přes email

### Hlášení chyb

Pokud najdete chybu v aplikaci:
1. Popište, co se stalo
2. Uveďte kroky k reprodukci
3. Přiložte případně screenshot
4. Odešlete na email podpory

---

## 12. Tipy pro lepší využití

### Pro uživatele:
- ✅ Rezervujte včas, oblíbené akce se rychle vyprodají
- ✅ Zkontrolujte si email po rezervaci
- ✅ Stáhněte si vstupenku předem (funguje i offline)
- ✅ Přijďte s QR kódem, ušetříte čas při vstupu

### Pro organizátory:
- ✅ Vyplňte podrobný popis akce
- ✅ Přidejte atraktivní obrázek
- ✅ Publikujte akci s dostatečným předstihem
- ✅ Sledujte statistiky a počet rezervací
- ✅ Při zrušení informujte účastníky co nejdříve

### Pro administrátory:
- ✅ Řešte reklamace co nejrychleji
- ✅ Pravidelně kontrolujte dashboard
- ✅ Monitorujte aktivitu uživatelů
- ✅ Zálohujte důležitá data

---

**Děkujeme, že používáte náš rezervační systém!** 🎉

---

**Verze dokumentu:** 1.0  
**Datum:** 24. 12. 2024
