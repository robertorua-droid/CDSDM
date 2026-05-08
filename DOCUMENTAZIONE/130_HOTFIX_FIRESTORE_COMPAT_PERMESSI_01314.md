# 130 — Hotfix Firestore compatibilità permessi 0.13.14

## Problema

In alcune schermate dell’area Organizzazione potevano comparire pagine vuote o l’errore:

```text
db(...).collection is not a function
```

Il problema riguardava il modo in cui alcuni servizi risolvevano l’istanza Firestore compat rispetto alla variabile globale legacy `db`.

## Correzione

La 0.13.14:

- espone Firestore anche come `window.db` e `globalThis.db` in `initFirebase()`;
- corregge il resolver Firestore di Profili permesso, Matrice permessi e Override legacy;
- rende Gruppi aziendali più resiliente se il caricamento profili fallisce temporaneamente.

## Cosa non cambia

- Nessuna nuova collezione Firestore.
- Nessuna modifica a `firestore.rules`.
- Nessun backend custom.
- Nessuna Cloud Function obbligatoria.
- Nessun ritorno agli override individuali come flusso operativo.

## Uso previsto

I privilegi si gestiscono da:

```text
Organizzazione → Gruppi aziendali
Organizzazione → Profili permesso
Organizzazione → Matrice permessi
```

Il modello resta: membro → ruolo/profilo → permessi effettivi.
