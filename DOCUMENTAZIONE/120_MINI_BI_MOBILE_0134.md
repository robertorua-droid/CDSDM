# 120 — Mini B.I. sintetica mobile 0.13.4

La versione **0.13.4** consolida l'uso da smartphone della **Mini B.I. didattica** senza introdurre nuovi flussi applicativi, nuove voci di menu, nuove collezioni Firestore o modifiche alle regole.

## Obiettivo

Rendere la Mini B.I. più leggibile in consultazione mobile, mantenendo il comportamento desktop già esistente.

La Mini B.I. resta un cruscotto didattico basato su dati già caricati in `AppStore/globalData` e provenienti da Firestore. Non vengono salvate nuove aggregazioni e non viene introdotta persistenza aggiuntiva.

## Cosa cambia

- Aggiunto il servizio UI `js/ui/mobile-bi-service.js`.
- Aggiunto un suggerimento mobile nella pagina Mini B.I.
- Migliorate le tab delle aree operative su smartphone.
- Migliorate le card KPI su schermi piccoli.
- Migliorate azioni CSV/report e pulsanti alert B.I.
- Rafforzata la leggibilità di drill-down, tabelle e fonti dati.

## Cosa non cambia

- Nessuna nuova collezione Firestore.
- Nessuna nuova regola Firestore.
- Nessun backend custom.
- Nessuna Cloud Function obbligatoria.
- Nessuna nuova voce di menu.
- Nessuna modifica ai permessi Mini B.I.
- Nessuna modifica alle formule KPI.

## Uso didattico consigliato da smartphone

Su smartphone la Mini B.I. va considerata una vista sintetica:

1. leggere le card KPI principali;
2. cambiare area solo se necessario;
3. usare i filtri periodo prima del drill-down;
4. aprire il dettaglio KPI solo per approfondimenti mirati;
5. usare CSV/report prevalentemente da tablet o desktop se il dataset è ampio.

## Limiti noti

Le tabelle di drill-down molto ricche restano consultabili, ma non diventano un ambiente di analisi avanzata da telefono. Per confronti estesi, catalogo KPI, QA ruoli e export massivi resta preferibile desktop/tablet.

## Test

La verifica browser-based 0.13.4 controlla:

- presenza del nuovo servizio mobile B.I.;
- caricamento del servizio in `index.html`;
- versione backup JSON `0.13.4`;
- presenza CSS dedicato;
- assenza di nuove collezioni Firestore;
- aggiornamento documentale.
