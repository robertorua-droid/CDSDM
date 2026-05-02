# Stampe e PDF HTML avanzati 0.4.0

La versione 0.4.0 introduce la sezione **Analisi → Stampe / PDF**.

## Obiettivo

La funzione centralizza la produzione di stampe gestionali in formato HTML, pensate per essere salvate in PDF tramite il browser:

- estratto conto cliente/fornitore;
- partitario clienti/fornitori;
- fattura / nota di credito vendita;
- prima nota / movimenti finanziari;
- solleciti e promemoria scadenze.

## Architettura

Nuovi file:

```text
js/features/accounting/print-template-service.js
js/features/accounting/print-center-module.js
```

Il servizio genera documenti HTML standalone con intestazione aziendale, KPI/riepiloghi, tabelle e footer didattico. Il modulo UI mostra anteprima in iframe e offre i comandi:

- rigenera anteprima;
- stampa / salva come PDF;
- scarica HTML.

## Persistenza

La release non introduce nuove collezioni Firestore. I template leggono dati già caricati nella SPA:

```text
companyInfo
customers
suppliers
invoices
purchases
paymentEvents
cashbookMovements
reminderEvents
```

## Limiti voluti

Non viene introdotto un generatore PDF server-side e non viene usata una libreria esterna obbligatoria. Il PDF si ottiene usando la funzione nativa del browser **Stampa → Salva come PDF**.

Questo mantiene il progetto coerente con l'architettura didattica front-end only.
