- OK - nelze rezervovat vstupenky -> "Chyba při vytváření rezervace"
- OK - profil -> člen od: Invalid Date
- OK - ve formuláři vytváření nových akcí se překrývá logo kategorie v sekci kategorie
- OK - Akce bez úvodní fotky se zobrazí blbě. Nahraď to něčím
- OK - neexistující url přesměruje kam?
- OK - "Nepodařilo se načíst platbu" Chyba při načítání platby error
- OK - otestovat po zaplacení - Pokud byla platba provedena, označí se k refundaci
- STRIPE_WEBHOOK_SECRET kde zjistit a k čemu?
- email notifikace o zrušení akce
- vstupenka byla stažena (placeholder)
- Email potvrzení je odeslán (po implementaci)

Co dál?

• Potvrzení rezervace jsme zaslali na váš e-mail
• Vstupenku si můžete stáhnout nebo ji najdete v "Moje rezervace"
• Před akcí vám pošleme připomenutí
• Vstupenku předložte na akci (QR kód)

stripe listen --forward-to localhost:3001/api/payments/webhook
npm run prisma:seed
npx prisma migrate reset