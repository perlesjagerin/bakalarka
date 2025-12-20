- OK - nelze rezervovat vstupenky -> "Chyba při vytváření rezervace"
- OK - profil -> člen od: Invalid Date
- OK - ve formuláři vytváření nových akcí se překrývá logo kategorie v sekci kategorie
- OK - Akce bez úvodní fotky se zobrazí blbě. Nahraď to něčím
- OK - neexistující url přesměruje kam?
- OK - "Nepodařilo se načíst platbu" Chyba při načítání platby error
- OK - otestovat po zaplacení - Pokud byla platba provedena, označí se k refundaci
- OK - email notifikace o zrušení akce
- OK - STRIPE_WEBHOOK_SECRET kde zjistit a k čemu?
- OK - vstupenka byla stažena (placeholder)
- OK - Email potvrzení je odeslán (po implementaci)
- OK - text v pdf špatně vygenerován, jsou tam neznámé znaky (opraveno - použití Arial TTF s plnou podporou Unicode)
- OK - jak řešit refundaci zadarmo akcí (automaticky - Stripe refund se volá pouze při amount > 0, jinak jen zrušení rezervace)

stripe listen --forward-to localhost:3001/api/payments/webhook
npm run prisma:seed
npx prisma migrate reset