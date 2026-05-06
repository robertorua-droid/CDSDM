# 119. Workflow e Segnalazioni operative mobile 0.13.3

La versione **0.13.3** prosegue il ramo mobile avviato con 0.13.0, 0.13.1 e 0.13.2.

L'obiettivo è migliorare l'uso da smartphone dei due flussi operativi più adatti a consultazione e interventi rapidi:

- **Analisi → Workflow approvativi**;
- **Analisi → Segnalazioni operative**.

La release non introduce nuove collezioni Firestore, nuove regole, nuovi menu o nuovi workflow dati. Le modifiche sono UI/UX progressive e reversibili.

## Cosa migliora

### Workflow approvativi

Su smartphone la pagina evidenzia meglio:

- filtri principali;
- riepilogo attività;
- attività come schede responsive grazie al servizio tabelle 0.13.2;
- pulsanti di azione più grandi e distribuiti su griglia;
- storico recente leggibile in colonna.

Le azioni disponibili restano le stesse:

- Approva;
- Revisione;
- Respingi;
- Blocca;
- Apri documento collegato.

### Segnalazioni operative

Su smartphone la pagina evidenzia meglio:

- filtri di stato, area, gravità e ricerca;
- riepilogo segnalazioni;
- elenco come schede;
- tab elenco/nuova segnalazione più facili da toccare;
- dettaglio segnalazione in colonna;
- pulsanti di workflow operativo più leggibili.

La persistenza resta sulla collezione ufficiale:

```text
operationalReports
```

## Servizio UI aggiunto

È stato aggiunto:

```text
js/ui/mobile-workflow-service.js
```

Il servizio non modifica i dati. Aggiunge classi CSS, suggerimenti contestuali mobile e migliora la disposizione dei pulsanti nelle sezioni già esistenti.

## Compatibilità

Le modifiche sono attive soprattutto sotto i 576 px. Su desktop e tablet il comportamento resta quello precedente.

## Limiti noti

La 0.13.3 non riscrive i form documentali complessi. Fatture, DDT, ordini e import/export restano aree da trattare in release successive, se necessario.

## QA

Il test browser-based 0.13.3 verifica:

- caricamento del nuovo servizio UI;
- presenza delle classi CSS mobile;
- presenza dei riferimenti a Workflow e Segnalazioni operative;
- assenza di nuove collezioni Firestore;
- aggiornamento versione a 0.13.3.
