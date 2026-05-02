# Centro notifiche operativo 0.4.1

La versione 0.4.1 introduce una vista unica per gli alert operativi più importanti del gestionale.

## Fonti dati

Il centro notifiche lavora esclusivamente su dati già presenti in memoria e su servizi esistenti:

- scadenze clienti/fornitori dallo scadenzario;
- prodotti sotto scorta;
- lotti, matricole e scadenze;
- DDT cliente non fatturati;
- ordini cliente/fornitore aperti;
- riconciliazioni collegate a eventi pagamento mancanti;
- controlli QA contabili.

## Caratteristiche

- riepilogo notifiche totali, critiche, attenzioni e informative;
- filtri per categoria e priorità;
- ricerca testuale;
- orizzonte configurabile per scadenze e lotti;
- apertura rapida della sezione collegata;
- export CSV.

## Vincoli architetturali

La funzione non introduce nuove collezioni Firestore e non modifica automaticamente i dati. È una vista derivata pensata per orientare l’utente verso le sezioni operative corrette.
