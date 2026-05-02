### Versione 0.3.3 - Estratto conto cliente/fornitore
La versione 0.3.3 introduce Contabilità → Estratto conto: saldo iniziale, movimenti di periodo, saldo progressivo, saldo finale, export CSV e stampa HTML. Non introduce nuove collezioni Firestore.

### Versione 0.3.3 - Estratto conto cliente/fornitore
La versione 0.3.3 introduce Contabilità → Estratto conto: vista derivata dal partitario con saldo iniziale, movimenti di periodo, saldo progressivo, saldo finale, export CSV e stampa HTML. Non introduce nuove collezioni Firestore e riusa fatture, acquisti, paymentEvents e pagamenti legacy.

### Versione 0.3.2 - Prima nota / movimenti finanziari
La versione 0.3.2 introduce Contabilità → Prima nota: registro finanziario semplificato con movimenti automatici derivati da incassi/pagamenti, movimenti manuali di cassa/banca, saldi per conto ed export CSV. La nuova collezione opzionale `cashbookMovements` contiene solo i movimenti manuali.

### Versione 0.3.1 - Incassi e pagamenti evoluti
La versione 0.3.1 introduce la sezione Contabilità → Incassi e pagamenti, con registrazione movimenti cliente/fornitore, allocazione su più documenti, metodo, riferimento, data valuta e collezione opzionale paymentEvents. I dati legacy negli array payments restano compatibili e vengono letti da scadenzario e partitario.

### Versione 0.2.6 - Ruoli e permessi
Introdotti controlli applicativi front-end per ruoli e permessi: Admin, Commerciale, Magazzino, Contabilità e Sola lettura. La persistenza resta in `settings/companyInfo.accessControl`, senza backend custom e senza nuove collezioni Firestore obbligatorie. Nota: i controlli sono didattici/UX e non sostituiscono regole Firestore di sicurezza.

### Versione 0.2.5 - Import massivi CSV
La versione 0.2.5 introduce import massivi CSV con template, anteprima, validazione e conferma prima del salvataggio.

### Versione 0.2.3 - Valorizzazione magazzino
La versione 0.2.3 evolve l'inventario valorizzato in una vista di valorizzazione magazzino con metodo selezionabile: prezzo anagrafico, ultimo costo da DDT fornitore e costo medio ponderato semplificato. I calcoli restano derivati dai dati esistenti (prodotti e DDT fornitore), senza nuove collezioni Firestore, senza backend custom e con fallback compatibile ai prezzi anagrafici.

# Documentazione

In questa cartella (`docs/`) sono presenti alcuni README “storici” degli step.

La documentazione aggiornata della versione stabile (manuale utente, guida laboratorio, workflow tecnico, ecc.) è nella cartella:

- `DOCUMENTAZIONE/00_INDICE.md`

- `DOCUMENTAZIONE/12_VALORIZZAZIONE_MAGAZZINO.md`: note utente e tecniche sulla valorizzazione magazzino 0.2.3.

- [13_LOTTI_MATRICOLE_SCADENZE.md](../DOCUMENTAZIONE/13_LOTTI_MATRICOLE_SCADENZE.md) — Tracciabilità opzionale 0.2.4.

- [14_IMPORT_MASSIVI_CSV.md](../DOCUMENTAZIONE/14_IMPORT_MASSIVI_CSV.md) — Import massivi CSV 0.2.5.

- `DOCUMENTAZIONE/23_CONSOLIDAMENTO_QA.md` - Consolidamento QA e coerenza contabile 0.3.7.

- `DOCUMENTAZIONE/24_STAMPE_PDF_HTML.md` - Stampe e PDF HTML avanzati 0.4.0.
- `DOCUMENTAZIONE/25_CENTRO_NOTIFICHE.md` - Centro notifiche operativo 0.4.1.
