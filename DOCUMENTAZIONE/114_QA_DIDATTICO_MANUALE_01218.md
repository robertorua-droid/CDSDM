# 114. QA didattico Manuale Utente 0.12.18

La versione **0.12.18** consolida CDSDM come progetto didattico documentato. Non introduce nuovi flussi applicativi, nuove voci di menu, nuove collezioni Firestore o Cloud Functions obbligatorie.

## Obiettivo

Rendere il Manuale Utente un riferimento autonomo per:

- studenti che devono svolgere esercitazioni;
- docenti che preparano simulazioni aziendali;
- professionisti che vogliono comprendere il prototipo gestionale didattico.

## Ambito della release

La release aggiorna manualistica e test di coerenza:

- manuale a capitoli aggiornato a 0.12.18;
- percorsi Studente, Docente e Professionista;
- checklist operative per capitolo;
- esercitazioni guidate;
- chiarimento su menu reale, workflow e segnalazioni operative;
- verifica che `operationalReports` resti documentata come collezione Firestore ufficiale;
- conferma compatibilità `users/{uid}` e `businessGroups/{groupId}`.

## Cosa non cambia

- Nessun backend custom.
- Nessuna Cloud Function obbligatoria.
- Nessuna nuova collezione Firestore.
- Nessuna modifica richiesta a `firestore.rules`.
- Nessuna rottura dati esistenti.
- Nessuna nuova voce di menu.

## Criteri QA

Il manuale deve contenere:

1. una spiegazione introduttiva del progetto;
2. percorsi separati per Studente, Docente e Professionista;
3. capitoli per anagrafiche, vendite, acquisti, magazzino, contabilità, workflow, segnalazioni, Mini B.I., backup e permessi;
4. checklist operative;
5. esercitazioni guidate con obiettivo, passaggi e risultato atteso;
6. riferimenti ai percorsi Firestore supportati;
7. collegamento concettuale tra aiuti rapidi e capitoli manuale.

## Test

Aggiunto `tests/manuale-qa-didattico-01218.test.html`, che verifica la presenza dei principali blocchi didattici nel manuale sincronizzato in `docs-content.js`.
