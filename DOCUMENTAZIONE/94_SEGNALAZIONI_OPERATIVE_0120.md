# 0.12.0 — Fondazione segnalazioni operative

La release introduce **Workflow → Segnalazioni operative** e la nuova collezione Firestore `operationalReports`.

La funzione consente di registrare anomalie, richieste di verifica e comunicazioni operative tra reparti. È pensata per simulare la gestione reale di una azienda senza backend custom e senza Cloud Functions obbligatorie.

## Collezione

```text
businessGroups/{groupId}/operationalReports/{reportId}
users/{uid}/operationalReports/{reportId}   # compatibilità legacy
```

## Campi principali

- `code`, `type`, `category`, `severity`, `status`, `priority`;
- `originArea`, `targetArea`, `assigneeArea`;
- `title`, `description`, `actionRequired`, `resolutionNotes`;
- collegamenti a prodotto, cliente, fornitore e documento;
- `messages` per comunicazioni interne simulate;
- metadata `createdAt`, `updatedAt`, `createdBy`, `updatedBy`.

La collezione è inclusa in `CDSDM_DATA_COLLECTIONS`, quindi backup/import/reset e `AppStore/globalData` la trattano come dato operativo.
