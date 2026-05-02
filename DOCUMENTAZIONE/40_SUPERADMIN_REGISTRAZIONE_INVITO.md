# Superadmin e registrazione con invito 0.6.0

La versione **0.6.0** introduce una gestione utenti applicativa coerente con il vincolo del progetto: solo front-end, Firebase Auth e Firestore.

## Obiettivo

Consentire a una prima email amministrativa di inizializzare il ruolo di **superadmin** e permettere ai collaboratori/studenti di creare un account Firebase solo se hanno un invito applicativo valido.

## Cosa cambia nella login

La schermata iniziale ora contiene:

```text
Accedi
Password dimenticata? Invia link di reset
Registrati con invito
```

Il pulsante **Registrati con invito** richiede:

- email invitata;
- password desiderata;
- ID Gruppo aziendale;
- codice invito.

La registrazione usa Firebase Auth con `createUserWithEmailAndPassword`. Subito dopo il gestionale tenta l’accettazione invito e crea:

```text
businessGroups/{groupId}/members/{uid}
users/{uid}/memberships/{groupId}
```

## Superadmin

Il pannello è disponibile in:

```text
Impostazioni → Superadmin
```

Se `appSettings/system` non esiste, il primo account Firebase autenticato può inizializzare il documento globale:

```text
appSettings/system
```

Il documento contiene:

```text
superadminUid
superadminEmail
superadminEmails
status
schemaVersion
createdAt
createdBy
```

Questa soluzione non legge la lista utenti di Firebase Auth, perché da front-end non è disponibile l’Admin SDK. Per questo il bootstrap va eseguito con attenzione usando la prima email amministrativa prevista per il corso.

## Inviti

Gli inviti restano sotto:

```text
businessGroups/{groupId}/invites/{inviteCode}
```

L’invito contiene email e ruolo. L’utente può accettarlo solo se l’email dell’account Firebase coincide con l’email dell’invito.

## Limite tecnico dichiarato

Il gestionale non crea account Firebase per conto di altri utenti come farebbe un backend amministrativo. Il collaboratore crea il proprio account con la propria password durante il flusso di invito.

## Regole Firestore

La 0.6.0 aggiorna `firestore.rules` per:

- bootstrap di `appSettings/system` solo se assente;
- gestione superadmin globale;
- profili `userProfiles/{uid}`;
- lettura/scrittura gruppi da parte del superadmin;
- accettazione inviti da parte dell’utente invitato.

Le regole diventano effettive solo dopo pubblicazione su Firebase.
