# 118. Tabelle e liste responsive 0.13.2

La versione **0.13.2** prosegue il ramo mobile avviato con l'audit 0.13.0 e con la mobile usability base 0.13.1.

Questa release introduce un adattamento prudente delle tabelle su smartphone: le tabelle già presenti nell'app restano tabelle classiche su desktop e tablet, mentre sotto i 576 px vengono rese più leggibili tramite una visualizzazione a schede progressive.

## Obiettivo didattico e operativo

L'obiettivo non è trasformare CDSDM in una app mobile completa, ma rendere più chiara la consultazione dei dati tabellari da telefono.

Uso consigliato da smartphone dopo la 0.13.2:

- consultare elenchi di anagrafiche e documenti;
- leggere righe di report senza dover interpretare molte colonne compresse;
- controllare stati, importi, date e azioni principali;
- usare il manuale e gli aiuti rapidi mentre si osservano liste operative.

Uso ancora consigliato da desktop/tablet:

- compilare documenti complessi con molte righe;
- fare import/export e backup/reset/import;
- configurare permessi, audit e console docente avanzata;
- analizzare drill-down Mini B.I. molto ampi.

## Intervento tecnico

È stato aggiunto il servizio front-end:

```text
js/ui/responsive-tables-service.js
```

Il servizio:

- rileva tabelle HTML con intestazione `thead th`;
- assegna ai `td` un attributo `data-label` ricavato dall'intestazione;
- applica la classe `cdsdm-mobile-card-table`;
- osserva le tabelle create dinamicamente dai moduli tramite `MutationObserver`;
- espone `window.CDSDMResponsiveTables` per test e QA.

Le regole CSS sono conservative:

- desktop e tablet restano invariati;
- sotto 576 px le righe diventano schede leggibili;
- le etichette delle colonne appaiono sopra il valore;
- i pulsanti restano distanziati per uso touch;
- l'allineamento numerico desktop non viene forzato su mobile.

## Esclusioni

La 0.13.2 non introduce:

- nuove collezioni Firestore;
- nuove regole Firestore;
- nuove voci di menu;
- nuovi workflow;
- nuovi flussi applicativi;
- backend custom;
- Cloud Functions obbligatorie.

## Limiti noti

La trasformazione a schede è progressiva e generica. Per tabelle molto specialistiche potrebbe essere preferibile, in futuro, una resa mobile dedicata per modulo.

Esempi di possibili evoluzioni successive:

```text
0.13.3 — Segnalazioni operative e workflow mobile
0.13.4 — Mini B.I. sintetica mobile
0.13.5 — Form complessi e documenti gestionali mobile-aware
```

## QA browser-based

La release aggiunge:

```text
tests/mobile-tabelle-responsive-0132.test.html
```

Il test verifica:

- presenza del nuovo servizio responsive;
- caricamento del servizio da `index.html`;
- versione in-app 0.13.2;
- `appVersion` backup JSON 0.13.2;
- presenza delle classi CSS mobile per tabelle a schede;
- presenza del documento 118 sincronizzato in `docs-content.js`.
