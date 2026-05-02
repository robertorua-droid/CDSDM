# Consolidamento QA, UX e coerenza contabile 0.3.7

La versione 0.3.7 è una release di consolidamento dopo l'espansione 0.2.x e 0.3.x.

## Obiettivo

La release non introduce nuove aree operative. Rafforza la coerenza trasversale tra:

- scadenzario evoluto;
- incassi e pagamenti;
- partitario;
- estratto conto;
- prima nota;
- riconciliazione banca;
- budget e marginalità;
- ruoli e permessi;
- backup, import e reset dati.

## Nuovo controllo tecnico

È stato aggiunto il servizio:

```text
js/features/accounting/accounting-consistency-service.js
```

Il servizio esegue controlli client-side non distruttivi su:

- eventi `paymentEvents` con importo nullo o allocazioni incoerenti;
- documenti cliente/fornitore con incassi o pagamenti superiori al totale;
- collegamento tra `paymentEvents` e prima nota automatica;
- storico riconciliazioni collegato a eventi pagamento esistenti;
- presenza delle collezioni opzionali introdotte nelle release 0.2.x e 0.3.x.

## Persistenza

La release non introduce nuove collezioni Firestore e non modifica il modello dati esistente.

Le collezioni presidiate restano:

```text
warehouseLots
paymentEvents
cashbookMovements
reminderEvents
bankReconciliationEvents
businessBudgets
```

## Test

È stata aggiunta la suite browser-based:

```text
tests/accounting-consistency-037.test.html
```

La suite verifica un dataset coerente e un dataset volutamente incoerente, controllando che il servizio segnali warning contabili senza bloccare l'app.

## Limiti

I controlli sono diagnostici e didattici: non sostituiscono una contabilità generale certificata e non applicano correzioni automatiche ai dati.
