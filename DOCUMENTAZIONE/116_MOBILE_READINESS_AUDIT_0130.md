# 116. Mobile readiness audit 0.13.0

La versione **0.13.0** avvia il ramo mobile di CDSDM con un audit prudente: verifica ciò che è già realmente compatibile con smartphone e tablet prima di modificare layout, menu o flussi operativi.

## Scopo della release

La 0.13.0 non è un redesign mobile. È una fotografia tecnica e didattica dello stato reale dell’applicazione.

Obiettivi:

- individuare le aree già consultabili da smartphone;
- distinguere consultazione, operatività leggera e operatività completa;
- documentare i punti che richiedono adattamento UX prima di intervenire;
- aggiungere un test browser-based di readiness mobile;
- mantenere invariati dati, regole Firestore, menu e flussi.

## Cosa non cambia

La release **non introduce**:

- nuove voci di menu;
- nuove schermate operative;
- nuove collezioni Firestore;
- nuove regole Firestore;
- backend custom;
- Cloud Functions obbligatorie;
- refactor grafico invasivo;
- modalità offline o PWA completa.

Restano invariati i percorsi dati:

```text
users/{uid}
businessGroups/{groupId}
```

## Rilievi tecnici sullo stato reale

L’audit statico sul pacchetto 0.12.19 di partenza evidenzia questi elementi.

### Elementi favorevoli alla compatibilità mobile

- `index.html` contiene il meta viewport, quindi il browser mobile non forza una pagina desktop scalata.
- L’app usa Bootstrap, griglia responsive e card, elementi che possono adattarsi progressivamente.
- Sono presenti numerosi wrapper `table-responsive`, utili per evitare rotture immediate delle tabelle.
- Le modali Bootstrap e il manuale in-app sono già contenuti HTML consultabili da browser mobile.
- Firebase Auth e Firestore non richiedono backend aggiuntivo per l’accesso da smartphone.

### Criticità da non sottovalutare

- La sidebar desktop ha larghezza fissa storica, circa 252/260 px, e non esiste ancora una navigazione mobile dedicata equivalente a un menu compatto.
- Il progetto contiene molte tabelle gestionali e schermate con griglie ampie: su smartphone una tabella scrollabile è tecnicamente accessibile ma non sempre comoda.
- Sono presenti molti layout basati su classi `col-md`/`col-lg`, quindi diverse sezioni potrebbero impilarsi correttamente ma richiedere verifica visuale.
- Flussi come fatture, DDT, ordini, import/export, audit sicurezza e console docente restano più adatti a desktop o tablet.
- La Mini B.I. avanzata e i drill-down possono essere consultabili, ma richiedono una rappresentazione sintetica per smartphone.

## Classificazione provvisoria delle aree

### Compatibilità alta per consultazione

- Info, Manuale Utente e aiuti rapidi.
- Dashboard sintetica.
- Consultazione anagrafiche e documenti, se le tabelle restano scrollabili.
- Centro notifiche e lettura messaggi.

### Compatibilità media per operatività leggera

- Segnalazioni operative: consultazione, apertura e cambio stato semplice.
- Workflow approvativi: approvazione o revisione rapida.
- Ricerca prodotti, clienti, fornitori e documenti.
- Mini B.I. in forma sintetica.

### Compatibilità bassa per operatività completa

- Compilazione completa di fatture, DDT e ordini con molte righe.
- Import/export e backup/reset/import.
- Configurazione avanzata ruoli, permessi, audit e console docente.
- Drill-down B.I. complessi e report con molte colonne.

## Linea guida per le prossime versioni

La 0.13.0 consiglia di procedere per micro-release:

```text
0.13.1 — Navigazione mobile e layout adattivo di base
0.13.2 — Tabelle gestionali responsive/card mobile
0.13.3 — Segnalazioni operative e workflow mobile
0.13.4 — Manuale e percorsi didattici mobile
```

Ogni release successiva dovrebbe modificare una sola famiglia di problemi, con test browser-based dedicati.

## Criteri minimi di verifica mobile

Per ogni pagina importante, prima di dichiararla mobile-friendly, verificare almeno:

- larghezza 360 px, 390 px e 430 px;
- assenza di overflow orizzontale non intenzionale;
- pulsanti principali visibili e premibili;
- form compilabili senza zoom forzato;
- modali leggibili e chiudibili;
- tabelle consultabili o convertite in card;
- aiuto rapido e manuale raggiungibili.

## Test aggiunto

La release aggiunge:

```text
tests/mobile-readiness-0130.test.html
```

Il test verifica la presenza degli elementi minimi di readiness, documenta le criticità note e conferma che la 0.13.0 è una release di audit, non di redesign.
