# 45. Regole Firestore rafforzate 0.6.5

## Versione 0.6.5

La versione **0.6.5** rafforza le regole Firestore dei Gruppi aziendali usando i permessi effettivi già denormalizzati sui membri dalla 0.6.4.

## Obiettivo

Le versioni precedenti proteggevano i dati condivisi soprattutto con:

```text
membership attiva + ruolo operativo
```

La 0.6.5 aggiunge un secondo livello:

```text
membership attiva + effectiveProfilePermissions per scope/modulo
```

In questo modo la UI e le regole Firestore leggono la stessa matrice effettiva quando disponibile.

## Fonte dati usata dalle rules

Le regole leggono il documento:

```text
businessGroups/{groupId}/members/{uid}
```

in particolare il campo:

```text
effectiveProfilePermissions
```

Esempio:

```json
{
  "customers": "write",
  "sales": "read",
  "invoices": "none",
  "warehouse": "admin"
}
```

## Livelli riconosciuti

```text
none  = nessun accesso
read  = lettura
write = creazione e modifica
admin = creazione, modifica ed eliminazione/configurazione
```

## Mappatura collection → scope

Le rules mappano le collection operative su scope applicativi, ad esempio:

```text
customers                 → customers
suppliers                 → suppliers
products                  → products
quotes/customerOrders     → sales
invoices/notes            → invoices
purchases/supplierDDTs    → purchases
warehouseMovements/lots   → warehouse
paymentEvents/cashbook    → accounting
workflowEvents            → workflow
auditEvents               → audit
```

## Regola di compatibilità

Se un membro non ha ancora `effectiveProfilePermissions`, le rules mantengono il comportamento legacy basato sul ruolo operativo.

Questo evita rotture nei gruppi già creati prima della 0.6.5.

## Eliminazioni

La 0.6.5 rende più prudente l'eliminazione dei dati condivisi:

- `admin`, `teacher` e superadmin possono eliminare;
- un membro non amministratore può eliminare solo se il suo livello effettivo sullo scope è `admin`;
- il livello `write` consente creazione/modifica, ma non eliminazione.

## Collezioni sensibili

Restano riservate ad admin/teacher:

```text
members
invites
permissionProfiles
permissionMatrices
teachingScenarios
migrationReports
```

Gli invitati possono ancora accettare un invito valido tramite il flusso email-based, ma non possono modificare liberamente membri o gruppo.

## Limiti intenzionali

Firestore Rules non sostituisce un backend amministrativo. Per questo la 0.6.5 mantiene logiche semplici e verificabili:

- permessi effettivi già denormalizzati sul member doc;
- nessuna query complessa sui profili;
- fallback ruolo per compatibilità;
- blocco predefinito su percorsi non documentati.

## File coinvolti

```text
firestore.rules
js/core/permissions-policy.js
tests/firestore-rules-065.test.html
```

