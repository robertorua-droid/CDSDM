# 128 — Hotfix registrazione invito e rules 0.13.12

## Obiettivo

La versione **0.13.12** corregge due punti emersi nel collaudo reale della registrazione con invito.

## Problema

Il collaboratore poteva ricevere:

```text
Missing or insufficient permissions
```

Il messaggio può dipendere da due condizioni:

1. regole Firestore pubblicate nel progetto Firebase non aggiornate rispetto al pacchetto;
2. errore di caricamento dati successivo all’accettazione dell’invito, trattato troppo aggressivamente come fallimento dell’intera registrazione.

## Correzioni

- Il client distingue meglio accettazione invito e caricamento dati.
- Se l’invito è stato accettato, l’account appena creato non viene eliminato per un errore successivo di caricamento.
- Le regole Firestore sono state rese più tolleranti per il retry su `members/{uid}` quando l’utente corrisponde all’invito pending.
- Il messaggio `permission-denied` indica esplicitamente di pubblicare le regole Firestore aggiornate.

## Azione richiesta

Dopo aver caricato la build, pubblicare anche `firestore.rules` nel progetto Firebase.

Percorso Firebase Console:

```text
Firestore Database → Rules → incolla firestore.rules del pacchetto → Publish
```

Poi generare un nuovo invito e riprovare la registrazione.

## Compatibilità

La 0.13.12 non introduce nuove collezioni, backend custom o Cloud Functions obbligatorie.
