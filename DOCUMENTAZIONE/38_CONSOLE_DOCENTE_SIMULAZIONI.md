# Console docente e simulazioni di gruppo 0.5.5

La versione **0.5.5** introduce una Console docente per coordinare esercitazioni didattiche sui **Gruppi aziendali**.

La funzione resta coerente con l’architettura del progetto:

- single-page app front-end;
- Firebase Auth + Firestore;
- nessun backend applicativo custom;
- nessuna Cloud Function obbligatoria;
- dati separati per Gruppo aziendale.

## Obiettivo didattico

La Console docente consente al docente o all’amministratore del gruppo di:

- vedere indicatori rapidi del dataset condiviso;
- controllare membri attivi e inviti pendenti;
- creare scenari didattici da template;
- creare scenari personalizzati;
- avviare, mettere in pausa o completare una simulazione;
- consultare una timeline degli eventi didattici;
- copiare un report sintetico del gruppo.

## Accesso

La sezione è disponibile in:

```text
Impostazioni → Console docente
```

È visibile solo ai ruoli:

- `admin` / Amministratore;
- `teacher` / Docente o Revisore.

Gli altri ruoli continuano a lavorare nelle sezioni coerenti con i loro permessi UI.

## Collezioni Firestore introdotte

La 0.5.5 aggiunge due collezioni nel dataset del Gruppo aziendale:

```text
businessGroups/{groupId}/teachingScenarios/{scenarioId}
businessGroups/{groupId}/simulationEvents/{eventId}
```

### teachingScenarios

Contiene gli scenari didattici assegnati al gruppo.

Campi principali:

- `title`;
- `area`;
- `description`;
- `checklist`;
- `status`: `draft`, `active`, `paused`, `completed`;
- `assignedRoles`;
- `createdAt`, `createdBy`, `updatedAt`, `updatedBy`;
- `schemaVersion`.

### simulationEvents

Contiene la timeline didattica delle azioni registrate dalla Console docente.

Campi principali:

- `action`;
- `details`;
- `actorUid`;
- `actorEmail`;
- `createdAt`;
- `version`.

## Template scenario inclusi

La versione include template pronti per:

- ciclo vendite;
- acquisti e magazzino;
- contabilità e scadenze;
- revisione docente / audit finale.

Ogni template contiene descrizione, area, ruoli suggeriti e checklist operativa.

## Regole Firestore

`firestore.rules` è aggiornato per proteggere le nuove collezioni:

- lettura consentita ai membri attivi del gruppo;
- creazione, modifica ed eliminazione consentite solo ad `admin` e `teacher`;
- eventi simulazione creati con `actorUid` coerente con l’utente autenticato.

## Backup, import e reset

Le nuove collezioni `teachingScenarios` e `simulationEvents` sono incluse nell’elenco comune `CDSDM_DATA_COLLECTIONS`, quindi sono caricate, esportate/importate e copiate nei flussi generali che usano il root dati attivo.

## Limiti dichiarati

La Console docente 0.5.5 non crea ancora classi separate, calendari di consegna, valutazioni automatiche o duplicazione massiva di scenari tra più gruppi. Queste funzioni restano compatibili con la struttura introdotta e possono essere aggiunte in un consolidamento successivo.
