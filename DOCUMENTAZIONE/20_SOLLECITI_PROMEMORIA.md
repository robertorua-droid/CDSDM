# Solleciti e promemoria scadenze 0.3.4

La versione 0.3.4 introduce la sezione **Contabilità → Solleciti**.

La funzione è pensata come supporto operativo, didattico e realistico al ciclo scadenze:

- individua scadenze clienti/fornitori aperte o scadute usando lo scadenzario evoluto;
- calcola giorni di ritardo e livello sollecito: primo, secondo, terzo;
- genera un testo email/PEC copiabile manualmente;
- registra uno storico manuale dei solleciti nella collezione opzionale `reminderEvents`;
- consente export CSV delle scadenze filtrate.

## Architettura

Nuovi file:

```text
js/features/accounting/reminder-service.js
js/features/accounting/reminder-module.js
```

Il servizio legge dati già esistenti:

```text
customers
suppliers
invoices
purchases
paymentEvents
reminderEvents
```

La nuova collezione `reminderEvents` è opzionale e contiene solo lo storico dei promemoria/solleciti registrati manualmente.

## Limiti voluti

La SPA non invia email automatiche e non usa backend custom. Il testo generato va copiato nel client email/PEC e l'esito può essere registrato manualmente.

## Compatibilità

Se `reminderEvents` non esiste, la sezione funziona comunque mostrando le scadenze derivate. I documenti legacy senza storico solleciti hanno semplicemente contatore storico pari a zero.
