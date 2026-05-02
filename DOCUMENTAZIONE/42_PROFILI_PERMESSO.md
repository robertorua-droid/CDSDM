# 42. Profili permesso configurabili

## Versione 0.6.2

La versione 0.6.2 introduce i **profili permesso configurabili per Gruppo aziendale**.

La logica precedente dei ruoli resta valida, ma può essere affinata assegnando a ogni membro un profilo con matrice moduli:

- **Nessun accesso**;
- **Sola lettura**;
- **Lettura/Scrittura**;
- **Amministrazione**.

## Percorso UI

La nuova sezione è disponibile in:

`Impostazioni → Profili permesso`

È utilizzabile quando è selezionato un Gruppo aziendale attivo. Solo i ruoli `admin` e `teacher` possono creare, modificare o assegnare profili.

## Struttura Firestore

```text
businessGroups/{groupId}/permissionProfiles/{profileId}
businessGroups/{groupId}/members/{uid}.permissionProfileId
businessGroups/{groupId}/members/{uid}.profilePermissions
users/{uid}/memberships/{groupId}.permissionProfileId
users/{uid}/memberships/{groupId}.profilePermissions
```

Ogni profilo contiene:

```json
{
  "id": "sales_standard",
  "name": "Vendite standard",
  "roleBase": "sales",
  "permissions": {
    "customers": "write",
    "sales": "write",
    "invoices": "read",
    "warehouse": "read",
    "accounting": "read"
  },
  "status": "active"
}
```

## Moduli gestiti

I profili 0.6.2 coprono i principali ambiti applicativi:

- clienti;
- fornitori;
- prodotti e servizi;
- vendite;
- fatture;
- acquisti;
- magazzino;
- contabilità;
- commesse, progetti e timesheet;
- report;
- workflow;
- audit;
- stampe;
- import;
- impostazioni;
- utenti, ruoli e profili;
- console docente;
- migrazione e QA;
- gestione dati/reset.

## Relazione tra ruolo e profilo

Il **ruolo** resta la base della sicurezza e della membership.

Il **profilo permesso** aggiunge granularità didattica e UI:

- il ruolo stabilisce l’identità operativa principale dell’utente;
- il profilo stabilisce cosa vede e cosa può modificare nei moduli;
- le regole Firestore restano volutamente più semplici e robuste, basate soprattutto su membership e ruolo.

## Limiti consapevoli

La matrice profili è una protezione front-end didattica. Non deve essere considerata da sola sicurezza assoluta.

La release 0.6.5 potrà rafforzare le regole Firestore per recepire una parte dei profili sulle operazioni sensibili, mantenendo le regole leggibili e verificabili.
