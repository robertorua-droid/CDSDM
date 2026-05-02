# 47. Consolidamento tecnico generale 0.7.0

## Versione 0.7.0

La versione **0.7.0** apre il ramo di consolidamento 0.7.x. Non introduce nuove funzioni gestionali importanti: allinea struttura, versioni, backup/import/reset, documentazione, test browser-based e mappa moduli rispetto alla base stabile 0.6.6.

## Obiettivo

Il rilascio verifica e consolida:

- caricamento script in `index.html`;
- moduli duplicati, obsoleti o non referenziati;
- coerenza tra `AppStore`, `globalData`, `DomainConstants.DATA_COLLECTIONS`, Firebase e Gruppi aziendali;
- backup/import/reset rispetto alle collezioni Firestore reali;
- permessi UI e regole Firestore rispetto a ruoli, profili, matrice e override;
- documentazione tecnica, manuale, mappa moduli e documentazione in-app;
- test browser-based di regressione tecnica.

## Incoerenze rilevate nella 0.6.6

| Area | Evidenza | Intervento 0.7.0 |
| --- | --- | --- |
| Script SPA | `js/features/warehouse/customer-quotes-module.js` era un modulo legacy non caricato da `index.html`, duplicava il modulo preventivi corrente e usava la collezione non documentata `customerQuotes`. | Rimosso dal pacchetto per evitare ambiguità. Il modulo valido resta `quotes-module.js` su collezione `quotes`. |
| Cache iniziale | `globalData` e `AppStore.ensureGlobalData()` non inizializzavano sempre `migrationReports`, `permissionProfiles`, `permissionMatrices`, `securityAccessReports`. | Cache iniziale allineata a `CDSDM_DATA_COLLECTIONS`. |
| Backup/import | L'export JSON riportava `appVersion: 0.5.6` e non includeva `permissionProfiles`, `permissionMatrices`, `securityAccessReports`; l'import normalizzato non reimportava queste collezioni. | Export aggiornato a `0.7.0`; normalizzazione, import e stima uso dati includono le collezioni 0.6.x. |
| Test index | `tests/index.html` mostrava ancora `CDSDM 0.6.5` e l'audit 0.6.6 era fuori dalla griglia principale. | Indice test aggiornato a 0.7.0 con nuova suite di consolidamento. |
| Versione UI | La pagina versione mostrava 0.6.6. | Aggiornata a 0.7.0. |
| Documentazione | Indice, changelog, manuale, workflow e mappa moduli erano fermi al ramo 0.6.x. | Documentazione aggiornata e sincronizzata nella documentazione in-app. |

## Collezioni dati consolidate

`CDSDM_DATA_COLLECTIONS` è la fonte applicativa condivisa per caricamento, reset e coerenza backup. In 0.7.0 risultano allineate anche le collezioni di gestione gruppo introdotte nel ramo 0.6.x:

```text
migrationReports
permissionProfiles
permissionMatrices
securityAccessReports
```

Le collezioni di membership e inviti restano subcollection amministrative speciali (`members`, `invites`) e non vengono trattate come normali dati gestionali esportabili nel backup operativo.

## Note su Firestore Rules

`firestore.rules` resta coerente con il modello 0.6.5/0.6.6:

- compatibilità legacy `users/{uid}`;
- root dati condiviso `businessGroups/{groupId}`;
- permessi effettivi da `businessGroups/{groupId}/members/{uid}.effectiveProfilePermissions` quando presenti;
- fallback prudente ai ruoli per gruppi già esistenti;
- collezioni sensibili riservate ad admin/teacher/superadmin;
- nessun requisito di Cloud Functions.

## Test 0.7.0

Aggiunta suite browser-based:

```text
tests/consolidamento-070.test.html
```

La suite controlla staticamente:

- presenza e ordine degli script principali;
- assenza del modulo legacy `customer-quotes-module.js`;
- allineamento collezioni tra `DomainConstants`, `globalData`, backup/import e rules;
- versioni esposte in README, changelog, test index e UI;
- documentazione in-app aggiornata con il capitolo 47.

## Limiti intenzionali

La 0.7.0 non modifica il modello dati gestionale e non aggiunge nuove schermate operative. Le verifiche sono conservative e orientate alla stabilità didattica prima dei rilasci 0.7.1-0.7.5.
