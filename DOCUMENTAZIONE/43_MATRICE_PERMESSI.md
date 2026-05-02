# 43. Matrice permessi moduli

## Versione 0.6.3

La versione **0.6.3** introduce la pagina **Impostazioni → Matrice permessi**.

La matrice definisce, per ogni modulo applicativo, cosa significano i livelli:

- `none` — nessun accesso;
- `read` — apertura menu e consultazione;
- `write` — lettura, creazione e modifica;
- `admin` — gestione completa del modulo, incluse azioni più sensibili come eliminazione, import o configurazione quando disponibili.

## Differenza tra profilo e matrice

```text
Profilo permesso = assegna un livello a un utente/membro per ogni modulo.
Matrice permessi = spiega e configura le azioni UI associate a ogni livello.
```

Esempio:

```json
{
  "sales": "write",
  "invoices": "read",
  "warehouse": "none"
}
```

In questo caso il profilo dice che l'utente ha `write` su vendite. La matrice definisce che `write` consente menu, lettura, creazione e modifica, ma non eliminazione o configurazione.

## Struttura Firestore

```text
businessGroups/{groupId}/permissionMatrices/moduleMatrix
```

Il documento contiene:

```json
{
  "id": "moduleMatrix",
  "version": "0.6.3",
  "modules": {
    "sales": {
      "scope": "sales",
      "targets": ["preventivi", "ordini-cliente", "ddt-cliente"],
      "defaultLevel": "read",
      "actionModel": {
        "none": { "canOpenMenu": false, "canViewData": false },
        "read": { "canOpenMenu": true, "canViewData": true },
        "write": { "canCreate": true, "canEdit": true },
        "admin": { "canDelete": true, "canConfigure": true }
      }
    }
  }
}
```

## Moduli coperti

La matrice include i moduli principali:

- clienti;
- fornitori;
- prodotti e servizi;
- vendite;
- fatture;
- acquisti;
- magazzino;
- contabilità;
- commesse e timesheet;
- report;
- workflow;
- audit;
- stampe;
- import;
- impostazioni;
- utenti, ruoli e permessi;
- console docente;
- migrazione e QA;
- gestione dati/reset.

## Backup, import e reset

La collezione `permissionMatrices` è inclusa in `CDSDM_DATA_COLLECTIONS`, quindi viene considerata nei flussi comuni di backup/import/reset che usano il root dati attivo.

## Limiti consapevoli

La matrice 0.6.3 è una configurazione front-end didattica. Le regole Firestore proteggono il documento matrice e le membership, ma non applicano ancora ogni singolo flag del modello azioni ai documenti gestionali. Questo rafforzamento resta previsto nella 0.6.5.
