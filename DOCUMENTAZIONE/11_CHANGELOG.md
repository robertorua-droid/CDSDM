## 0.7.8 — Guida completa alle voci di menu e aiuto contestuale

- Aggiunto `DOCUMENTAZIONE/55_GUIDA_MENU_COMPLETA_078.md` con descrizione ordinata delle principali voci di menu.
- Aggiunto pulsante contestuale **?** nella barra superiore dell'app.
- Il pulsante apre il manuale in-app e posiziona l'utente sul capitolo corrispondente alla pagina attiva.
- Aggiornata documentazione fallback `docs-content.js` per consultazione anche senza fetch.
- Aggiunto test browser-based `tests/menu-help-078.test.html`.

# Changelog

## 0.7.7 — Correzione bootstrap Superadmin e guida regole Firestore

- Bootstrap Superadmin più tollerante: se la lettura di `appSettings/system` è negata, il sistema tenta comunque la creazione iniziale del documento.
- Messaggio di errore esplicito quando Firestore nega anche la scrittura: pubblicare `firestore.rules` del pacchetto oppure creare manualmente `appSettings/system`.
- Documentata la distinzione tra Superadmin globale e amministratore/docente del gruppo.
- Confermato il percorso corretto per gli inviti agli studenti: **Gruppi aziendali → Crea invito collaboratore**.

## 0.7.6 — Chiarimento Superadmin, docente e inviti studenti

- Chiarita la distinzione tra Superadmin globale e amministratore/docente del Gruppo aziendale.
- Migliorata la diagnostica del pannello Superadmin in caso di permessi Firestore insufficienti.
- Aggiunto collegamento rapido dal pannello Superadmin a Gruppi aziendali per creare inviti.
- Documentato il percorso corretto per invitare gli studenti.


## Versione 0.7.5 — Pacchetto stabile per uso in classe, collaudo finale e checklist docente

- Aggiunta checklist docente per uso in classe.
- Pacchetto finale progressivo 0.7.5.

---

## Versione 0.7.4 — Dataset demo, scenari didattici e casi d’uso guidati

- Aggiunto dataset demo e scenari didattici.

---

## Versione 0.7.3 — Miglioramento UX, testi di aiuto, onboarding e messaggi di errore

- Migliorata UX didattica con aiuti rapidi.

---

## Versione 0.7.2 — Manuale d’uso completo e guida didattica docente/studente

- Estesi manuale e guida passo-passo.
- Aggiunto capitolo 49.

---

## Versione 0.7.1 — QA funzionale end-to-end e correzione regressioni operative

- Aggiunto catalogo QA dei flussi principali.
- Nessuna modifica distruttiva ai dati.

---

## Versione 0.7.0 — Consolidamento tecnico generale e pulizia regressioni

- Analizzato il pacchetto reale 0.6.6 e prodotto `REPORT_INCOERENZE_0.7.0.md`.
- Rimosso `js/features/warehouse/customer-quotes-module.js`, modulo legacy non caricato e non allineato a `CDSDM_DATA_COLLECTIONS`.
- Allineate cache iniziali `globalData` e `AppStore` con `migrationReports`, `permissionProfiles`, `permissionMatrices` e `securityAccessReports`.
- Aggiornato backup/import/reset: export `appVersion: 0.7.0`, import normalizzato e stima uso dati includono le collezioni 0.6.x.
- Aggiornate versione UI, README, workflow tecnico, manuale, mappa moduli, indice documentazione e documentazione in-app.
- Aggiornato `tests/index.html` e aggiunta suite browser-based `tests/consolidamento-070.test.html`.
- Confermata la compatibilità con `users/{uid}` legacy e `businessGroups/{groupId}` senza backend custom e senza Cloud Functions obbligatorie.

---

# Versione 0.6.6 — Audit sicurezza, report utenti e QA accessi

La versione 0.6.6 consolida il ramo gestione utenti 0.6.x aggiungendo una pagina di audit per admin, teacher e superadmin.

## Aggiunto

- `SecurityAuditService`;
- `security-audit-module.js`;
- sezione **Impostazioni → Audit sicurezza**;
- report membri, ruoli, profili, override e permessi effettivi;
- findings automatici su configurazioni rischiose;
- checklist QA accessi;
- salvataggio report in `securityAccessReports`;
- documentazione `46_AUDIT_SICUREZZA_QA_ACCESSI.md`;
- test `security-audit-066.test.html`.

## Aggiornato

- `PermissionsPolicy` alla versione 0.6.6;
- `PermissionMatrixService` e `PermissionProfilesService` con scope `securityAudit`;
- `firestore.rules` con match dedicato a `securityAccessReports`;
- `CDSDM_DATA_COLLECTIONS` per backup/import/reset.

---

# Versione 0.6.5 — Regole Firestore rafforzate

La versione 0.6.5 rafforza la sicurezza dati dei Gruppi aziendali usando i permessi effettivi denormalizzati sui membri.

## Novità

- `firestore.rules` legge `effectiveProfilePermissions` quando disponibile;
- mappatura collection → scope applicativo;
- `read/write/admin` applicati anche lato Firestore per i dati di gruppo;
- eliminazioni più prudenziali: solo admin/teacher/superadmin o livello `admin` sullo scope;
- fallback ruoli per compatibilità con gruppi legacy;
- `PermissionsPolicy` aggiornata alla 0.6.5;
- test `firestore-rules-065.test.html`;
- documentazione `45_REGOLE_FIRESTORE_RAFFORZATE.md`.

---

# Versione 0.6.4 — Override permessi per singolo utente

La versione 0.6.4 introduce eccezioni individuali sui permessi dei membri dei Gruppi aziendali.

## Aggiunto

- sezione **Impostazioni → Override permessi**;
- `js/features/business-groups/permission-overrides-service.js`;
- `js/features/business-groups/permission-overrides-module.js`;
- livelli override `inherit`, `none`, `read`, `write`, `admin`;
- vista comparativa: permesso ereditato dal profilo, override e permesso effettivo;
- salvataggio override su `members/{uid}` e `users/{uid}/memberships/{groupId}`;
- audit applicativo `permission_overrides_saved`;
- test `tests/permission-overrides-064.test.html`.

## Aggiornato

- `PermissionsPolicy` passa a 0.6.4 e fonde profilo + override;
- `PermissionProfilesService` mantiene gli override esistenti quando cambia il profilo assegnato a un membro;
- menu, documentazione, manuale in-app e mappa moduli aggiornati.

## Nota tecnica

Gli override sono controlli applicativi/UX. La 0.6.5 rafforzerà le regole Firestore su ruoli operativi e operazioni sensibili.

---

# Versione 0.6.3 — Matrice permessi moduli

La versione 0.6.3 formalizza il catalogo moduli e il significato operativo dei livelli `none`, `read`, `write`, `admin`.

## Aggiunto

- sezione **Impostazioni → Matrice permessi**;
- `js/features/business-groups/permission-matrix-service.js`;
- `js/features/business-groups/permission-matrix-module.js`;
- collezione `businessGroups/{groupId}/permissionMatrices`;
- catalogo moduli con scope, categoria e voci menu collegate;
- modello azioni per livello: menu, lettura, crea, modifica, elimina, export, import, configura;
- salvataggio, reset e copia JSON della matrice;
- test `tests/permission-matrix-063.test.html`.

## Aggiornato

- `PermissionsPolicy` passa a 0.6.3 e espone funzioni per livello permesso e catalogo moduli;
- `PermissionProfilesService` usa il catalogo modulo 0.6.3 quando disponibile;
- `firestore.rules` protegge `permissionMatrices`;
- backup/import/reset includono `permissionMatrices`;
- documentazione, mappa moduli e manuale in-app aggiornati.

## Nota tecnica

La matrice 0.6.3 resta una configurazione UI/applicativa. Il blocco Firestore granulare su profili e operazioni sensibili è previsto nella 0.6.5.

---

# Versione 0.6.2 — Profili permesso configurabili per gruppo

La versione 0.6.2 introduce una matrice permessi configurabile per Gruppo aziendale.

## Novità

- Nuova sezione **Impostazioni → Profili permesso**.
- Nuovo servizio `PermissionProfilesService`.
- Nuovo modulo UI `permission-profiles-module.js`.
- Nuova collezione Firestore `businessGroups/{groupId}/permissionProfiles`.
- Profili predefiniti per admin, teacher, accounting, sales, purchases, warehouse e readonly.
- Matrice moduli con livelli `none`, `read`, `write`, `admin`.
- Assegnazione profili ai membri del gruppo.
- Salvataggio profilo su member e membership utente.
- Inviti con profilo iniziale opzionale.
- `PermissionsPolicy` aggiornata alla 0.6.2 per leggere `profilePermissions` quando presenti.
- Test `tests/permission-profiles-062.test.html`.

## Nota tecnica

I profili permesso sono una granularità applicativa/front-end. Le regole Firestore restano ancorate a membership e ruolo, con match esplicito per `permissionProfiles`. Il rafforzamento lato rules è previsto nella 0.6.5.

---

# Versione 0.6.1 — Inviti avanzati e onboarding collaboratori

La versione 0.6.1 completa il flusso di registrazione con invito introdotto nella 0.6.0.

## Aggiunto

- stati invito `pending`, `accepted`, `revoked`, `expired`;
- validità configurabile dell’invito;
- note onboarding;
- filtri inviti per email e stato;
- rigenerazione codice invito;
- consolidamento inviti scaduti;
- istruzioni copiabili per il collaboratore;
- test `tests/invites-onboarding-061.test.html`.

## Aggiornato

- `BusinessGroupsService` passa a versione 0.6.1;
- `business-groups-module.js` mostra pannello inviti avanzato;
- `auth-module.js` gestisce meglio il fallimento della registrazione con invito e prova a rimuovere l’account appena creato;
- `firestore.rules` verifica la scadenza degli inviti salvati come timestamp;
- README, manuale, workflow tecnico e documentazione in-app aggiornati.

## Non modificato

- nessun backend custom;
- nessuna Cloud Function obbligatoria;
- nessuna creazione amministrativa server-side di account Auth.

---

# Versione 0.6.0 — Bootstrap superadmin e registrazione con invito

La versione 0.6.0 apre il ramo gestione utenti applicativa sopra la base multiutente 0.5.x.

## Aggiunto

- pulsante **Registrati con invito** nella schermata di login;
- registrazione Firebase Auth con `createUserWithEmailAndPassword`;
- accettazione invito automatica dopo creazione account;
- pannello **Impostazioni → Superadmin**;
- `js/features/business-groups/superadmin-service.js`;
- `js/features/business-groups/superadmin-module.js`;
- documento globale `appSettings/system`;
- profili applicativi leggeri `userProfiles/{uid}`;
- test `tests/superadmin-registration-060.test.html`;
- documentazione `40_SUPERADMIN_REGISTRAZIONE_INVITO.md`.

## Aggiornato

- `auth-module.js` gestisce login, reset password e registrazione con invito;
- `BusinessGroupsService` passa a versione 0.6.0;
- accettazione invito più compatibile con le regole Firestore: l’invitato crea member/membership ma non aggiorna il root del gruppo;
- `firestore.rules` introduce funzioni `isGlobalSuperadmin` e `validSystemBootstrap`;
- `PermissionsPolicy` include il target `superadmin` per admin/teacher;
- `index.html`, README, mappa moduli, workflow tecnico e documentazione in-app aggiornati.

## Non modificato

- nessun backend custom;
- nessuna Cloud Function obbligatoria;
- nessuna creazione amministrativa server-side di account Auth;
- i dati legacy personali non vengono cancellati.
## 0.7.7 — Correzione bootstrap Superadmin e guida regole Firestore

- Reso il bootstrap Superadmin più tollerante quando la lettura preventiva di `appSettings/system` è negata da regole Firestore non ancora allineate.
- Migliorato il messaggio di errore: se Firestore nega anche la scrittura, occorre pubblicare `firestore.rules` del pacchetto o creare manualmente `appSettings/system` in Firebase Console.
- Chiarito che gli inviti studenti si creano da **Gruppi aziendali**, non dal pannello Superadmin.
