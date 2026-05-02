# 44. Override permessi per singolo utente

## Versione 0.6.4

La versione **0.6.4** introduce gli **override permessi per singolo membro** dei Gruppi aziendali.

## Obiettivo

Consentire a un admin/teacher di applicare eccezioni puntuali senza duplicare profili o cambiare il ruolo dell'utente.

Esempi didattici:

- Marco è `sales`, ma può leggere il magazzino.
- Giulia è `accounting`, ma non può usare import/reset.
- Luca è `warehouse`, ma può consultare i report.

## Percorso UI

```text
Impostazioni → Override permessi
```

La pagina mostra:

- membro selezionato;
- ruolo;
- profilo permesso assegnato;
- override attivi;
- tabella moduli con livello ereditato, override e livello effettivo.

## Livelli disponibili

```text
inherit - usa il valore del profilo assegnato
none    - nessun accesso
read    - sola lettura
write   - lettura/scrittura
admin   - amministrazione/configurazione
```

## Ordine di valutazione

```text
ruolo base → profilo permesso → override utente
```

Gli override sostituiscono solo i moduli esplicitamente configurati. Tutti gli altri moduli continuano a ereditare il profilo.

## Persistenza Firestore

Gli override sono campi denormalizzati:

```text
businessGroups/{groupId}/members/{uid}.permissionOverrides
businessGroups/{groupId}/members/{uid}.effectiveProfilePermissions
users/{uid}/memberships/{groupId}.permissionOverrides
users/{uid}/memberships/{groupId}.effectiveProfilePermissions
```

Questa scelta evita query aggiuntive al login: la `PermissionsPolicy` legge subito la membership attiva e applica i permessi effettivi.

## Sicurezza

Gli override 0.6.4 sono controlli applicativi/front-end. Le regole Firestore restano basate principalmente su membership e ruolo operativo. Il rafforzamento lato rules su profili, override e operazioni sensibili è previsto nella 0.6.5.
