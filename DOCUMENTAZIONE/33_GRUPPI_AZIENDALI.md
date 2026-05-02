# Gruppi aziendali condivisi — versione 0.5.0

La versione 0.5.0 introduce i **Gruppi aziendali**: aziende simulate condivise da più utenti Firebase, pensate per esercitazioni didattiche in classe.

## Obiettivo

Un Gruppo aziendale rappresenta un dataset aziendale comune. Gli studenti accedono con login Firebase differenti, ma possono lavorare sugli stessi dati quando selezionano lo stesso gruppo.

Esempio:

```text
Gruppo aziendale: Alfa S.r.l.
- Anna: Amministratore
- Marco: Vendite
- Giulia: Contabilità
- Luca: Magazzino
```

## Persistenza Firestore

La release mantiene compatibilità con il modello legacy per utente e introduce un nuovo root dati condiviso:

```text
businessGroups/{groupId}
businessGroups/{groupId}/members/{uid}
businessGroups/{groupId}/settings/companyInfo
businessGroups/{groupId}/customers
businessGroups/{groupId}/suppliers
businessGroups/{groupId}/products
businessGroups/{groupId}/invoices
businessGroups/{groupId}/purchases
businessGroups/{groupId}/warehouseMovements
businessGroups/{groupId}/workflowEvents
businessGroups/{groupId}/auditEvents
users/{uid}/memberships/{groupId}
```

Quando un gruppo è attivo, `saveDataToCloud`, `batchSaveDataToCloud`, `deleteDataFromCloud` e `loadAllDataFromCloud` usano `businessGroups/{groupId}` come root. Se nessun gruppo è attivo, il gestionale continua a usare il percorso legacy `users/{uid}`.

## Creazione gruppo

La nuova voce **Impostazioni → Gruppi aziendali** consente di:

- creare un Gruppo aziendale;
- creare automaticamente la membership del creatore come `admin`;
- selezionare il gruppo attivo;
- tornare temporaneamente ai dati personali legacy;
- copiare prudentemente i dati legacy nel primo gruppo.

## Migrazione prudente

La copia legacy è opzionale e non distruttiva:

- non cancella `users/{uid}`;
- conserva gli ID dei documenti;
- aggiunge metadati come `businessGroupId`, `migratedAt` e `migratedFromLegacyUid`;
- copia `settings/companyInfo` e le collezioni gestionali note.

## Ruoli

La 0.5.0 registra il ruolo del creatore come `admin`. Sono già definite le etichette dei ruoli previsti per le release successive:

- `admin` / Amministratore;
- `accounting` / Contabilità;
- `sales` / Vendite;
- `purchases` / Acquisti;
- `warehouse` / Magazzino;
- `readonly` / Sola lettura;
- `teacher` / Docente/Revisore.

La gestione completa di inviti, membri e ruoli è stata introdotta nella 0.5.1; i permessi UI nella 0.5.2 e le regole Firestore nella 0.5.3.

## Backup, import e reset

Le funzioni di gestione dati lavorano sul root dati attivo:

- se è selezionato un Gruppo aziendale, backup/import/reset leggono e scrivono nel gruppo;
- se nessun gruppo è selezionato, restano sui dati personali legacy;
- l'export JSON include `persistenceScope` e le informazioni del gruppo attivo.

## Limiti dichiarati 0.5.0

- Non introduce backend custom.
- Non richiede Cloud Functions.
- Non implementa ancora inviti completi o amministrazione membri avanzata.
- Non implementa ancora il controllo concorrenza 0.5.4.
- Le regole Firestore multiutente complete sono previste nella 0.5.3.

## File principali

```text
js/features/business-groups/business-groups-service.js
js/features/business-groups/business-groups-module.js
js/services/firebase-cloud.js
js/core/utils.js
index.html
css/style.css
tests/business-groups-050.test.html
```


## Aggiornamento successivo 0.5.1

La gestione completa di membri, ruoli e inviti semplici è stata introdotta nella documentazione dedicata `34_MEMBRI_INVITI_RUOLI.md`.
