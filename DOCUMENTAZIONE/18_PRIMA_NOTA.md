# Prima nota / movimenti finanziari 0.3.2

La versione 0.3.2 introduce la sezione **Contabilità → Prima nota**.

La funzione è un registro finanziario didattico e operativo che combina:

- movimenti automatici derivati da **Incassi e pagamenti** (`paymentEvents`);
- movimenti manuali salvati nella collezione opzionale `cashbookMovements`;
- riepiloghi per entrate, uscite, saldo periodo e saldo per conto;
- filtri per tipo movimento, conto, periodo e testo;
- export CSV.

## Principio architetturale

La prima nota non introduce un backend applicativo custom e non sostituisce la contabilità generale. È una vista gestionale semplificata:

```text
paymentEvents → movimenti automatici di prima nota
cashbookMovements → movimenti manuali di cassa/banca
```

Gli incassi cliente sono trattati come entrate; i pagamenti fornitore come uscite. I movimenti manuali servono per spese generiche, entrate non documentali e giroconti.

## Compatibilità dati

La nuova collezione `cashbookMovements` è opzionale. Se assente, la sezione mostra comunque i movimenti derivati da `paymentEvents` e dai pagamenti legacy gestiti dal servizio pagamenti.

Backup, import, reset totale, stima uso dati e caricamento Firestore includono `cashbookMovements`.
