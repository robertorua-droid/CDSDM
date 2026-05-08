# 127 — Hotfix registrazione con invito 0.13.11

## Problema

Durante la registrazione con invito, un collaboratore poteva ricevere l’errore Firestore:

```text
Missing or insufficient permissions
```

La causa era una lettura anticipata del documento root `businessGroups/{groupId}` prima che l’utente invitato fosse già membro del gruppo. Le regole Firestore bloccavano correttamente quella lettura.

## Correzione

La versione **0.13.11** modifica il flusso di accettazione invito:

- l’invitato legge l’invito consentito dalle rules;
- crea `members/{uid}` e `users/{uid}/memberships/{groupId}`;
- usa `groupName`, `groupId`, ruolo e profilo iniziale già presenti nell’invito;
- solo dopo la creazione membership può leggere il gruppo come membro attivo.

## Firestore rules

`firestore.rules` non è stato modificato. Il vincolo resta corretto: un utente non membro non deve leggere il documento root del gruppo, salvo i dati minimi contenuti nell’invito a lui destinato.

## Compatibilità

La 0.13.11 non introduce:

- nuove collezioni;
- nuove regole;
- backend custom;
- Cloud Functions obbligatorie;
- modifiche ai dati esistenti.
