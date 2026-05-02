# 26. Workflow approvativi leggeri (0.4.2)

La versione 0.4.2 introduce la sezione **Analisi → Workflow approvativi**.

## Scopo

Il workflow approvativo è un livello operativo leggero sopra i dati già presenti: preventivi, ordini, DDT, fatture, acquisti, note di credito, incassi/pagamenti e riconciliazioni. Serve a evidenziare ciò che deve essere verificato, approvato, respinto o bloccato.

## Collezione opzionale

Gli eventi manuali sono salvati in `workflowEvents` con origine documento, azione, stato precedente, stato successivo, nota, data e utente.

## Stati

- `draft`: bozza;
- `pending_review`: da verificare;
- `approved`: approvato;
- `rejected`: respinto;
- `blocked`: bloccato.

## Limiti

I controlli sono applicativi/front-end e didattici. Non sostituiscono regole Firestore di sicurezza né firme o approvazioni legalmente vincolanti.

## Compatibilità

I documenti esistenti senza `workflowStatus` vengono interpretati con fallback conservativi. I dati legacy restano leggibili e non richiedono migrazioni obbligatorie.
