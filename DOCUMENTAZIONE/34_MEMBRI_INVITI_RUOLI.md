# Membri, inviti e ruoli — versione 0.5.1

La versione 0.5.1 completa il primo livello collaborativo dei **Gruppi aziendali** introducendo membri, ruoli e inviti semplici.

## Obiettivo

Permettere a più account Firebase di partecipare allo stesso Gruppo aziendale con ruoli didattici distinti.

Esempio:

```text
Gruppo aziendale: Alfa S.r.l.
- Anna: admin / Amministratore
- Marco: sales / Vendite
- Giulia: accounting / Contabilità
- Luca: warehouse / Magazzino
- Prof.ssa Rossi: teacher / Docente/Revisore
```

## Cosa cambia rispetto alla 0.5.0

La 0.5.0 permetteva di creare e selezionare un gruppo condiviso. La 0.5.1 aggiunge:

- elenco membri del gruppo attivo;
- aggiunta diretta membro tramite UID Firebase;
- cambio ruolo;
- rimozione prudente membro tramite stato `removed`;
- creazione inviti semplici con codice;
- accettazione invito da parte dello studente;
- audit applicativo degli eventi principali.

## Ruoli disponibili

```text
admin       -> Amministratore
accounting  -> Contabilità
sales       -> Vendite
purchases   -> Acquisti
warehouse   -> Magazzino
readonly    -> Sola lettura
teacher     -> Docente/Revisore
```

In questa release `admin` e `teacher` possono gestire membri e inviti tramite UI. Gli altri ruoli sono predisposti per la release 0.5.2, dove verranno usati per permessi UI e visibilità menu.

## Gestione membri

Percorso: **Impostazioni → Gruppi aziendali**.

Con un gruppo attivo, un utente con ruolo `admin` o `teacher` può:

1. inserire UID Firebase del membro;
2. indicare email e ruolo;
3. aggiungere il membro al gruppo.

La scrittura aggiorna due punti Firestore:

```text
businessGroups/{groupId}/members/{uid}
users/{uid}/memberships/{groupId}
```

Questo consente allo studente di ritrovare il gruppo nella propria tendina dopo l’accesso.

## Inviti semplici

Gli inviti sono volutamente semplici e senza backend custom.

L’amministratore/docente genera un invito indicando email e ruolo. L’app crea un codice, ad esempio:

```text
ID gruppo: abc123
Codice invito: BG-ABCD-1XYZ
```

Lo studente accede con Firebase, apre **Gruppi aziendali**, inserisce ID gruppo e codice invito e accetta. L’app verifica che l’email dell’account corrisponda all’email invitata.

Gli inviti sono salvati in:

```text
businessGroups/{groupId}/invites/{inviteCode}
```

Stati previsti:

- `pending`;
- `accepted`;
- `revoked`.

## Audit applicativo

Le azioni principali registrano eventi in:

```text
businessGroups/{groupId}/auditEvents/{eventId}
```

Azioni tracciate:

- creazione gruppo;
- copia dati legacy;
- aggiunta membro;
- cambio ruolo;
- rimozione membro;
- creazione invito;
- revoca invito;
- accettazione invito.

Il registro resta un audit applicativo didattico, non un log forense immutabile.

## Limiti dichiarati 0.5.1

- I controlli ruoli sono front-end e didattici.
- La sicurezza Firestore dedicata è stata introdotta nella 0.5.3 con `firestore.rules`.
- Gli inviti non inviano email automaticamente.
- Non sono richiesti backend custom o Cloud Functions.
- Il controllo concorrenza multiutente resta pianificato nella 0.5.4.

## Impatto su backup/import/reset

La gestione dati continua a lavorare sul root dati attivo. Le membership e gli inviti sono metadati del gruppo, non dati gestionali ordinari da importare in un dataset contabile. I dati gestionali restano nelle collezioni già incluse in backup/import/reset.

## File principali

```text
js/features/business-groups/business-groups-service.js
js/features/business-groups/business-groups-module.js
tests/business-groups-051.test.html
DOCUMENTAZIONE/34_MEMBRI_INVITI_RUOLI.md
```
