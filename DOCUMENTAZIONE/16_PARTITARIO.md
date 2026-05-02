# Partitario clienti e fornitori 0.3.0

La versione 0.3.0 introduce una vista contabile didattica per consultare il partitario di clienti e fornitori.

## Obiettivo

Il partitario mostra i movimenti dare/avere collegati a un soggetto, usando dati già presenti nel gestionale:

- fatture cliente;
- note di credito cliente;
- acquisti fornitore;
- incassi e pagamenti registrati nello scadenzario tramite array `payments`;
- saldi progressivi e saldi aggregati per soggetto.

## Accesso

Menu: **Contabilità → Partitario**.

## Filtri disponibili

- tipo soggetto: clienti o fornitori;
- singolo cliente/fornitore o tutti;
- periodo da/a;
- ricerca su documento, descrizione e soggetto.

## Logica clienti

Nel partitario clienti:

- le fatture cliente aumentano il **Dare**;
- le note di credito e gli incassi aumentano l’**Avere**;
- il saldo positivo indica credito residuo verso il cliente.

## Logica fornitori

Nel partitario fornitori:

- gli acquisti aumentano l’**Avere**;
- i pagamenti aumentano il **Dare**;
- il saldo positivo indica debito residuo verso il fornitore.

## Architettura

Nuovi file:

- `js/features/accounting/ledger-service.js`;
- `js/features/accounting/ledger-module.js`.

Il servizio costruisce movimenti derivati e non persiste dati propri. La UI renderizza riepiloghi, tabella movimenti, saldi per soggetto ed export CSV.

## Persistenza

La release non introduce nuove collezioni Firestore. I dati restano nelle collezioni già esistenti:

- `invoices`;
- `purchases`;
- `customers`;
- `suppliers`.

Gli incassi e pagamenti vengono letti dagli array `payments` già introdotti nella 0.2.2.

## Limiti didattici

Il partitario non è una contabilità generale completa. È una vista gestionale realistica per analisi e controllo operativo, utile come base per le successive funzioni di incassi/pagamenti evoluti, prima nota, estratti conto e riconciliazione.
