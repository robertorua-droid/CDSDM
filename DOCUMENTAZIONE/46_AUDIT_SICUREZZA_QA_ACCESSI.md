# 46. Audit sicurezza, report utenti e QA accessi

## Versione 0.6.6

La versione **0.6.6** chiude il ramo 0.6.x dedicato alla gestione utenti applicativa, ai ruoli, ai profili permesso e agli accessi ai Gruppi aziendali.

## Obiettivo

La nuova sezione **Impostazioni → Audit sicurezza** consente ad admin, teacher o superadmin di verificare lo stato degli accessi del Gruppo aziendale attivo.

La funzione resta coerente con l'architettura del progetto:

- single-page app solo front-end;
- Firebase Auth + Firestore;
- nessun backend custom;
- nessuna Cloud Function obbligatoria;
- dati separati per `businessGroups/{groupId}`.

## Cosa controlla

Il report 0.6.6 legge e confronta:

- membri attivi del gruppo;
- ruoli operativi;
- profili permesso assegnati;
- override individuali;
- `effectiveProfilePermissions` denormalizzato;
- inviti e relativo stato;
- profili e matrici permesso;
- audit events recenti;
- stato superadmin applicativo;
- checklist QA accessi.

## Findings automatici

La pagina segnala automaticamente situazioni da verificare, ad esempio:

- gruppo senza admin/teacher attivo;
- membri senza `effectiveProfilePermissions`;
- utente `readonly` con permessi `write` o `admin`;
- inviti pendenti scaduti;
- inviti accettati non più collegati a membri attivi;
- email duplicate tra membri attivi;
- pochi profili permesso presenti;
- assenza di audit events recenti.

## Checklist QA accessi

La checklist include verifiche su:

1. bootstrap superadmin;
2. membership attive;
3. pulizia inviti;
4. permessi effettivi denormalizzati;
5. ruolo readonly sicuro;
6. presenza di almeno un admin/teacher;
7. pubblicazione manuale delle regole Firestore;
8. presenza di audit events.

La verifica sulle regole Firestore resta manuale: la SPA può includere `firestore.rules`, ma non può sapere se le regole sono state realmente pubblicate nel progetto Firebase.

## Persistenza Firestore

I report salvati vengono archiviati in:

```text
businessGroups/{groupId}/securityAccessReports/{reportId}
```

Ogni report contiene:

- `version`;
- `generatedAt`;
- `generatedBy`;
- `groupId`;
- `summary`;
- `members`;
- `invites`;
- `permissionProfiles`;
- `permissionMatrices`;
- `checklist`;
- `findings`.

La collezione è inclusa in `CDSDM_DATA_COLLECTIONS`, quindi viene considerata dai flussi comuni di backup/import/reset.

## Regole Firestore

`firestore.rules` include un match dedicato:

```text
businessGroups/{groupId}/securityAccessReports/{reportId}
```

Lettura e scrittura sono consentite ad admin, teacher o superadmin secondo le funzioni di membership e ruolo già introdotte nel ramo 0.6.x.

## Limiti intenzionali

L'audit 0.6.6 è un controllo applicativo/didattico. Non sostituisce:

- test reali con Firebase Emulator Suite;
- revisione manuale delle regole Firestore pubblicate;
- audit amministrativo lato Firebase Console;
- backend amministrativo con Admin SDK.

Serve però come cruscotto operativo per verificare in classe se utenti, ruoli, profili, override e inviti sono coerenti prima di una simulazione multiutente.
