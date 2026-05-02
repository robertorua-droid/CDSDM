# Regole Firestore per Gruppi aziendali e ruoli — versione 0.5.3

La versione **0.5.3** introduce una policy Firestore deployabile per proteggere i dati dei **Gruppi aziendali**.

## Obiettivo

Rendere effettiva lato database la separazione tra:

```text
users/{uid}                          -> dati personali legacy
businessGroups/{groupId}             -> dataset aziendale condiviso
businessGroups/{groupId}/members     -> membership e ruoli
businessGroups/{groupId}/invites     -> inviti semplici
businessGroups/{groupId}/{collection}-> dati gestionali condivisi
```

I permessi UI della 0.5.2 restano utili per UX e didattica, ma la protezione reale richiede il deployment di `firestore.rules`.

## File aggiunti

```text
firestore.rules
firebase.json
tests/firestore-rules-053.test.html
DOCUMENTAZIONE/36_REGOLE_FIRESTORE_GRUPPI_RUOLI.md
```

## Accesso legacy

Lo spazio legacy personale resta isolato:

```text
users/{uid}/...
```

Un utente autenticato può leggere e scrivere solo il proprio documento `users/{uid}` e le proprie sottocollezioni legacy.

Questo mantiene compatibilità con gli archivi nati prima dei Gruppi aziendali.

## Accesso ai Gruppi aziendali

Un utente può leggere un gruppo solo se esiste una membership attiva:

```text
businessGroups/{groupId}/members/{uid}.status == "active"
```

Le scritture sul documento principale del gruppo sono consentite a:

```text
admin
teacher
```

La creazione di un nuovo gruppo è consentita all'utente autenticato se `ownerUid` e `createdBy` coincidono con il proprio UID.

## Membri

I membri sono salvati in:

```text
businessGroups/{groupId}/members/{uid}
users/{uid}/memberships/{groupId}
```

Gli amministratori e i docenti possono aggiungere, aggiornare o rimuovere membri.

L'invitato può creare la propria membership solo se sta usando un invito pendente associato alla propria email autenticata.

## Inviti semplici

Gli inviti sono salvati in:

```text
businessGroups/{groupId}/invites/{inviteCode}
```

Regole principali:

- `admin` e `teacher` possono creare, revocare e gestire inviti;
- un invitato può leggere solo il proprio invito, verificato tramite email Firebase;
- un invitato può accettare l'invito solo se lo stato è `pending` e il codice è valido.

## Scrittura dati gestionali per ruolo

La regola `canWriteCollection(groupId, collectionId)` abilita le scritture per macro-area.

```text
admin / teacher -> tutte le collezioni condivise
readonly        -> sola lettura
accounting      -> fatture, acquisti, pagamenti, prima nota, scadenze, budget, registri
sales           -> clienti, preventivi, ordini cliente, DDT cliente, fatture cliente, commesse/timesheet
purchases       -> fornitori, ordini fornitore, DDT fornitore, acquisti, prodotti collegati
warehouse       -> prodotti, movimenti, inventario, lotti, DDT operativi
```

Le collezioni non riconosciute restano bloccate salvo ruolo `admin` o `teacher`.

## Deployment

Da Firebase Console:

1. aprire Firestore Database;
2. entrare nella sezione **Rules**;
3. incollare il contenuto di `firestore.rules`;
4. pubblicare.

Con Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

Il file `firebase.json` incluso punta a:

```json
{
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

## Limiti dichiarati 0.5.3

- Le regole non sostituiscono la progettazione didattica dei ruoli UI: entrambe le parti devono restare coerenti.
- Il controllo concorrenza avanzato non è ancora implementato.
- Le regole non inviano email e non richiedono Cloud Functions.
- Gli inviti restano semplici e basati su codice condiviso manualmente.
- Le regole devono essere deployate sul progetto Firebase: non sono attive automaticamente aprendo lo ZIP.

## Collegamento alla roadmap

```text
0.5.0 — Gruppi aziendali condivisi
0.5.1 — Membri, inviti e ruoli per gruppo
0.5.2 — Permessi UI e visibilità menu per ruolo
0.5.3 — Regole Firestore per gruppi e ruoli
0.5.4 — Controllo concorrenza e scritture sicure
```

## Aggiornamento 0.5.4 — documentLocks

La release 0.5.4 aggiunge la sottocollezione `businessGroups/{groupId}/documentLocks` per lock leggeri con scadenza. Le regole consentono ai membri attivi di creare/aggiornare un lock proprio o scaduto e di rilasciare solo i lock di cui sono proprietari.
