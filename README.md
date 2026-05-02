## CDSDM Versione 0.7.8 — Guida completa alle voci di menu e aiuto contestuale

La versione **0.7.8** aggiunge una guida ordinata per ogni voce di menu e un pulsante contestuale **?** nella barra superiore. Il pulsante apre il manuale sul capitolo collegato alla pagina visualizzata, migliorando uso didattico e onboarding senza introdurre nuove funzioni gestionali.

### Novità 0.7.8
- nuovo documento `DOCUMENTAZIONE/55_GUIDA_MENU_COMPLETA_078.md`;
- pulsante contestuale **?** nella barra superiore;
- collegamento automatico tra pagina attiva e paragrafo della guida;
- aggiornamento documentazione in-app e indice;
- test browser-based dedicato alla guida menu.

## CDSDM Versione 0.7.7 — Correzione bootstrap Superadmin e guida regole Firestore

- Corretto il flusso di bootstrap Superadmin quando la lettura preventiva di `appSettings/system` è bloccata da regole Firestore non allineate.
- Aggiunto messaggio operativo per pubblicare `firestore.rules` o creare manualmente `appSettings/system`.
- Ribadito che gli inviti studenti si creano da **Gruppi aziendali**, non dal pannello Superadmin.

---

## CDSDM Versione 0.7.6 — Pacchetto stabile per uso in classe, collaudo finale e checklist docente

- Chiuso ramo 0.7.x come pacchetto stabile.
- Aggiunta checklist docente e test finale.

---

## CDSDM Versione 0.7.5 — Dataset demo, scenari didattici e casi d’uso guidati

- Aggiunto dataset demo statico.
- Aggiunto validatore dataset non distruttivo.

---

## CDSDM Versione 0.7.5 — Miglioramento UX, testi di aiuto, onboarding e messaggi di errore

- Aggiunto OnboardingHelpService.
- Aggiunti testi di aiuto e CSS dedicato.

---

## CDSDM Versione 0.7.5 — Manuale d’uso completo e guida didattica docente/studente

- Consolidato manuale d’uso.
- Aggiunta guida didattica docente/studente.

---

## CDSDM Versione 0.7.5 — QA funzionale end-to-end e correzione regressioni operative

- Aggiunto servizio E2EQaService.
- Aggiunto test browser-based QA end-to-end.

---

## CDSDM Versione 0.7.5 — Consolidamento tecnico generale e pulizia regressioni

La versione **0.7.0** apre il ramo 0.7.x dedicato alla stabilizzazione didattica. Non introduce nuove funzioni gestionali importanti: consolida struttura, versioni, backup/import/reset, documentazione, test e coerenza tra moduli, Firestore e permessi.

### Novità 0.7.0

- analisi reale dello ZIP 0.6.6 e report sintetico `REPORT_INCOERENZE_0.7.0.md`;
- rimozione del modulo legacy non caricato `customer-quotes-module.js`, duplicato rispetto a `quotes-module.js`;
- allineamento `globalData`, `AppStore` e `CDSDM_DATA_COLLECTIONS` sulle collezioni 0.6.x;
- backup/import/reset consolidati per `permissionProfiles`, `permissionMatrices`, `securityAccessReports` e `migrationReports`;
- export JSON aggiornato con `appVersion: 0.7.0`;
- indice test aggiornato e nuova suite `tests/consolidamento-070.test.html`;
- documentazione, manuale, workflow tecnico, mappa moduli e documentazione in-app aggiornati.

### Roadmap 0.7.x

```text
0.7.0 Consolidamento tecnico generale e pulizia regressioni
0.7.1 QA funzionale end-to-end sui flussi principali
0.7.2 Manuale d'uso completo e guida didattica
0.7.3 Miglioramento UX, testi di aiuto e onboarding in-app
0.7.4 Dataset demo aggiornato e scenari didattici completi
0.7.5 Pacchetto stabile per uso in classe
```

---

## CDSDM Versione 0.6.6 — Audit sicurezza, report utenti e QA accessi

La versione **0.6.6** chiude il ramo 0.6.x della gestione utenti introducendo una sezione di audit per verificare membri, inviti, profili, override, permessi effettivi e checklist QA accessi del Gruppo aziendale attivo.

### Novità 0.6.6

- nuova sezione **Impostazioni → Audit sicurezza**;
- nuovo `SecurityAuditService`;
- nuovo modulo UI `security-audit-module.js`;
- report utenti con ruoli, profili, override e `effectiveProfilePermissions`;
- findings automatici su criticità comuni: readonly con scrittura, membri senza permessi effettivi, inviti scaduti, assenza admin/teacher;
- checklist QA accessi per simulazioni multiutente;
- salvataggio report in `businessGroups/{groupId}/securityAccessReports`;
- backup/import/reset aggiornati con `securityAccessReports`;
- `firestore.rules` aggiornate;
- test browser-based `tests/security-audit-066.test.html`.

### Roadmap 0.6.x completata

```text
0.6.0 Bootstrap superadmin e registrazione con invito
0.6.1 Inviti avanzati e onboarding collaboratori
0.6.2 Profili permesso configurabili per gruppo
0.6.3 Matrice permessi moduli
0.6.4 Override permessi per singolo utente
0.6.5 Regole Firestore rafforzate su ruoli/profili
0.6.6 Audit sicurezza, report utenti e QA accessi
```

---

## CDSDM Versione 0.6.5 — Regole Firestore rafforzate su ruoli, profili e operazioni sensibili

La versione **0.6.5** rafforza la sicurezza dei Gruppi aziendali portando nelle regole Firestore la matrice effettiva dei permessi introdotta in 0.6.2-0.6.4.

### Novità 0.6.5

- `firestore.rules` aggiornato con mappatura collection → scope applicativo;
- lettura/scrittura dati gruppo basata su `businessGroups/{groupId}/members/{uid}.effectiveProfilePermissions` quando presente;
- fallback prudente ai ruoli operativi per gruppi legacy senza permessi effettivi;
- eliminazioni riservate ad admin/teacher/superadmin o a membri con livello `admin` sullo scope;
- mantenimento delle collezioni sensibili riservate ad admin/teacher;
- `PermissionsPolicy` allineata alla versione 0.6.5;
- nuova documentazione `DOCUMENTAZIONE/45_REGOLE_FIRESTORE_RAFFORZATE.md`;
- nuovo test `tests/firestore-rules-065.test.html`.

### Modello sicurezza aggiornato

```text
0.6.2 Profilo permesso = matrice standard assegnabile al membro
0.6.3 Matrice moduli = definizione dei livelli none/read/write/admin
0.6.4 Override utente = eccezioni puntuali sul singolo membro
0.6.5 Rules rafforzate = Firestore legge effectiveProfilePermissions quando disponibile
```

### Nota operativa

Le regole Firestore diventano effettive solo dopo la pubblicazione su Firebase Console o con:

```bash
firebase deploy --only firestore:rules
```


---

## CDSDM Versione 0.6.4 — Override permessi per singolo utente

La versione **0.6.4** completa il livello applicativo dei permessi introducendo override individuali sui membri dei Gruppi aziendali. Un admin/teacher può personalizzare l'accesso di un singolo collaboratore senza modificare il profilo permesso assegnato al ruolo o agli altri utenti.

### Novità 0.6.4

- nuova sezione **Impostazioni → Override permessi**;
- nuovo servizio `PermissionOverridesService`;
- nuovo modulo UI `permission-overrides-module.js`;
- ordine effettivo dei permessi: **ruolo → profilo permesso → override utente**;
- override per modulo con livelli `inherit`, `none`, `read`, `write`, `admin`;
- riepilogo membro, profilo ereditato, override e livello effettivo;
- salvataggio denormalizzato su:
  - `businessGroups/{groupId}/members/{uid}`;
  - `users/{uid}/memberships/{groupId}`;
- `PermissionsPolicy` aggiornata alla 0.6.4 per applicare `effectiveProfilePermissions` e `permissionOverrides`;
- aggiornamento profili: quando si cambia profilo a un membro, gli override esistenti vengono mantenuti e ricalcolati;
- audit applicativo degli override in `auditEvents`;
- test browser-based `tests/permission-overrides-064.test.html`.

### Relazione con 0.6.2 e 0.6.3

```text
0.6.2 Profili permesso = livelli standard assegnati ai membri
0.6.3 Matrice permessi = azioni associate a ogni livello
0.6.4 Override utente = eccezioni puntuali sul singolo membro
```

### Persistenza

Gli override non richiedono una nuova collezione obbligatoria. Sono salvati come campi denormalizzati sui documenti membro/membership:

```text
businessGroups/{groupId}/members/{uid}.permissionOverrides
businessGroups/{groupId}/members/{uid}.effectiveProfilePermissions
users/{uid}/memberships/{groupId}.permissionOverrides
users/{uid}/memberships/{groupId}.effectiveProfilePermissions
```

### Nota sicurezza

Gli override 0.6.4 restano una granularità applicativa/front-end didattica. Le regole Firestore continuano a proteggere membership, ruoli e collezioni principali. Il rafforzamento delle rules su profili/operazioni sensibili resta previsto nella **0.6.5**.

## 0.7.7 — Correzione bootstrap Superadmin e guida regole Firestore

- Reso il bootstrap Superadmin più tollerante quando la lettura preventiva di `appSettings/system` è negata da regole Firestore non ancora allineate.
- Migliorato il messaggio di errore: se Firestore nega anche la scrittura, occorre pubblicare `firestore.rules` del pacchetto o creare manualmente `appSettings/system` in Firebase Console.
- Chiarito che gli inviti studenti si creano da **Gruppi aziendali**, non dal pannello Superadmin.
