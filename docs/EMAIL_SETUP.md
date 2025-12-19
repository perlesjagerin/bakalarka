# Email Notifikace - Konfigurace

## Přidání do .env souboru

Přidej tyto řádky do svého `.env` souboru:

```bash
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Frontend URL (pro odkazy v emailech)
FRONTEND_URL=http://localhost:5173
```

## Jak získat Gmail App Password

1. **Zapni 2-Factor Authentication** na svém Google účtu
   - Jdi na https://myaccount.google.com/security
   - Najdi "2-Step Verification" a zapni ho

2. **Vytvoř App Password**
   - Jdi na https://myaccount.google.com/apppasswords
   - Vyber aplikaci: "Mail"
   - Vyber zařízení: "Other (Custom name)" → zadej "Ticket Reservation System"
   - Google vygeneruje 16-ti místné heslo
   - Zkopíruj ho do `EMAIL_PASS` v `.env` (bez mezer)

## Typy emailových notifikací

### 1. Welcome Email 🎉
- **Kdy:** Po úspěšné registraci
- **Komu:** Nově registrovaný uživatel
- **Obsah:** Uvítací zpráva s odkazem na akce

### 2. Reservation Confirmation ✅
- **Kdy:** Po vytvoření rezervace
- **Komu:** Uživatel, který vytvořil rezervaci
- **Obsah:** 
  - Detail akce (název, datum, místo)
  - Počet vstupenek
  - Celková cena
  - Rezervační kód (důležitý pro vstup!)
  - Odkaz na "Moje rezervace"

### 3. Payment Confirmation 💳
- **Kdy:** Po úspěšném zaplacení (Stripe webhook)
- **Komu:** Uživatel, který zaplatil
- **Obsah:**
  - Částka platby
  - Název akce
  - Rezervační kód
  - Odkaz na stažení vstupenek

### 4. Reservation Cancellation ❌
- **Kdy:** Při zrušení rezervace
- **Komu:** Uživatel, jehož rezervace byla zrušena
- **Obsah:**
  - Název zrušené akce
  - Rezervační kód
  - Informace o refundaci (pokud byla platba dokončena)

### 5. Event Status Change 📢
- **Kdy:** Při změně stavu akce (PUBLISHED, CANCELLED, COMPLETED)
- **Komu:** Organizátor akce
- **Obsah:**
  - Název akce
  - Nový stav
  - Popis změny

### 6. Complaint Response 📝
- **Kdy:** Při vyřešení nebo zamítnutí reklamace
- **Komu:** Uživatel, který podal reklamaci
- **Obsah:**
  - Název akce
  - Stav reklamace (Vyřešena/Zamítnuta/V řešení)
  - Odpověď administrátora
  - Informace o refundaci (pokud byla schválena)

## Testování bez Gmail konfigurace

Pokud `EMAIL_USER` nebo `EMAIL_PASS` nejsou nastaveny:
- Aplikace **NEBUDE padat** ❌
- Místo odesílání emailů se vypíše log do konzole ℹ️
- Všechny ostatní funkce budou fungovat normálně ✅

Příklad logu:
```
⚠️  Email credentials not configured. Email notifications will be disabled.
   To enable emails, set EMAIL_USER and EMAIL_PASS in .env file
📧 Email would be sent to user@example.com: 🎉 Vítej v Rezervačním Systému!
```

## Email Templates

Všechny emaily mají:
- ✨ **Profesionální HTML design** s gradientním headerem
- 📱 **Responzivní layout** (funguje na mobilu i počítači)
- 🎨 **Barevné rozlišení** podle typu emailu:
  - Fialová: Obecné notifikace
  - Zelená: Platby a úspěchy
  - Červená: Zrušení
- 🔘 **Call-to-action buttony** s odkazy do aplikace
- 📋 **Strukturovaný obsah** pro snadné čtení

## Ukázka Welcome Emailu

```
┌─────────────────────────────────┐
│                                 │
│   Vítejte v Rezervačním         │
│        Systému! 🎉              │
│                                 │
├─────────────────────────────────┤
│                                 │
│  Ahoj Jan,                      │
│                                 │
│  Děkujeme za registraci!        │
│  Tvůj účet byl úspěšně          │
│  vytvořen.                      │
│                                 │
│  [Prohlédnout akce] 🔘         │
│                                 │
└─────────────────────────────────┘
```

## Bezpečnost

⚠️ **NIKDY nesdílej své EMAIL_PASS heslo!**
- Používej pouze App Password, ne své hlavní heslo
- Nepřidávej `.env` soubor do git repozitáře
- `.env` je již v `.gitignore`

## Produkční nasazení

Pro produkci doporuč použít:
- **SendGrid** (199 Kč/měsíc, 40k emailů)
- **Amazon SES** (pay-as-you-go, levné)
- **Mailgun** (první 3 měsíce zdarma)

Výhody profesionálních služeb:
- ✅ Lepší deliverability
- ✅ Detailní statistiky
- ✅ Neomezené množství
- ✅ Žádné Gmail limity

## Troubleshooting

### "Invalid login: 535-5.7.8 Username and Password not accepted"
- Zkontroluj, že máš zapnutou 2FA
- Vygeneruj nový App Password
- Ujisti se, že EMAIL_PASS neobsahuje mezery

### Emaily se neposílají
- Zkontroluj console log - jsou tam nějaké chyby?
- Zkontroluj, že jsou EMAIL_USER a EMAIL_PASS správně nastaveny
- Ujisti se, že EMAIL_PORT je 587 (nebo 465 pro SSL)

### Emaily končí ve spamu
- To je normální při testování s Gmail
- V produkci použij profesionální službu
- Přidej SPF a DKIM záznamy do DNS
