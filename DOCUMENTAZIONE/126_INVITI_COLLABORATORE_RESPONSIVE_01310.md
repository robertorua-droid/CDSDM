# 126 — Inviti collaboratore responsive 0.13.10

## Obiettivo

La versione **0.13.10** migliora l'usabilità del pannello inviti nei Gruppi aziendali.

Il feedback evidenziava due punti:

1. non era immediatamente chiaro se l'invito venisse inviato via email;
2. l'elenco inviti poteva diventare più largo dello schermo, generando scroll orizzontale.

## Chiarimento funzionale

CDSDM **non invia email automaticamente** quando viene generato un invito.

Il flusso resta volutamente front-end e compatibile con Firebase Auth + Firestore:

```text
1. il docente/amministratore genera l'invito;
2. copia codice invito e ID gruppo;
3. comunica manualmente questi dati al collaboratore/studente;
4. il collaboratore usa “Registrati con invito”.
```

Non sono stati introdotti backend custom, servizi email o Cloud Functions obbligatorie.

## Miglioramento UX

La tabella inviti è stata sostituita da una lista di card responsive.

Ogni card mostra:

- email invitata;
- codice invito;
- ruolo;
- profilo iniziale;
- stato;
- scadenza;
- azioni Copia, Rigenera e Revoca.

Le azioni si adattano allo spazio disponibile, evitando lo scroll orizzontale.

## Compatibilità

La 0.13.10 non modifica:

- collezioni Firestore;
- regole Firestore;
- ruoli e permessi;
- workflow di accettazione invito;
- compatibilità con `users/{uid}` e `businessGroups/{groupId}`.
