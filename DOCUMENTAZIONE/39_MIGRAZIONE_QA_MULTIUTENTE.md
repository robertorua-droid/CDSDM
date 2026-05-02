# Migrazione guidata e QA multiutente 0.5.6

La versione **0.5.6** consolida il ramo 0.5.x dedicato ai **Gruppi aziendali**.

L’obiettivo non è introdurre un nuovo backend, ma rendere più controllabile l’adozione didattica del multiutente:

- confronto tra dati legacy personali e dataset condiviso del Gruppo aziendale;
- copia prudente dei dati legacy nel gruppo attivo;
- report diagnostici salvabili nel gruppo;
- piano QA multiutente per prove in classe;
- aggiornamento backup/import/reset per includere tutte le collezioni 0.5.x.

## Accesso

La nuova sezione è disponibile in:

```text
Impostazioni → Migrazione e QA 0.5.6
```

È visibile e utilizzabile dai ruoli:

- `admin` / Amministratore;
- `teacher` / Docente o Revisore.

Gli altri ruoli continuano a usare le sezioni operative abilitate, ma non possono eseguire migrazioni guidate.

## Cosa verifica il report

Il report 0.5.6 mostra:

- utente autenticato;
- Gruppo aziendale attivo;
- ruolo corrente;
- membership disponibili;
- membri attivi del gruppo;
- conteggio record legacy sotto `users/{uid}`;
- conteggio record condivisi sotto `businessGroups/{groupId}`;
- confronto per collezione;
- checklist di prontezza;
- raccomandazioni operative.

Il report può essere copiato come JSON oppure salvato nella nuova collezione:

```text
businessGroups/{groupId}/migrationReports/{reportId}
```

## Copia prudente legacy → gruppo

La copia prudente usa ancora il comportamento introdotto in 0.5.0:

- legge i dati personali legacy dell’utente autenticato;
- copia `settings/companyInfo` e le collezioni gestionali nel Gruppo aziendale attivo;
- aggiunge metadati come `migratedFromLegacyUid`, `migratedAt` e `businessGroupId`;
- non cancella mai i dati legacy;
- blocca la copia se il gruppo contiene già dati, salvo scelta tecnica esplicita futura.

Questa scelta evita sovrascritture accidentali durante esercitazioni in classe.

## Backup/import/reset aggiornati

La 0.5.6 rende esplicito l’elenco comune delle collezioni dati in `DomainConstants.DATA_COLLECTIONS`, esposto anche come `window.CDSDM_DATA_COLLECTIONS`.

L’elenco include ora anche:

```text
teachingScenarios
simulationEvents
migrationReports
```

Backup, import, reset e caricamento cloud possono così trattare in modo uniforme le collezioni introdotte nel ramo 0.5.x.

## Piano QA multiutente

La sezione contiene un piano QA copiabile con verifiche su:

1. accesso con più account Firebase;
2. selezione dello stesso Gruppo aziendale;
3. ruoli e visibilità menu;
4. regole Firestore pubblicate;
5. copia dati legacy;
6. concorrenza e `docVersion`;
7. backup/import del gruppo;
8. Console docente e scenari.

## Regole Firestore

`firestore.rules` è aggiornato per proteggere `migrationReports`:

- lettura consentita ai membri attivi;
- creazione, modifica ed eliminazione consentite solo ad `admin` e `teacher`.

Le regole devono essere pubblicate nel progetto Firebase per diventare effettive.

## Limiti dichiarati

La 0.5.6 non introduce:

- Cloud Functions;
- backend custom;
- duplicazione massiva automatica di classi/scenari;
- risoluzione automatica di conflitti semantici tra documenti modificati da più utenti.

Questi punti restano compatibili con l’architettura attuale e possono essere sviluppati in rami successivi.
