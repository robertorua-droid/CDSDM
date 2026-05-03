# 86. Mini B.I. 0.10.7 — Stabilizzazione e QA regressione ruoli

La release 0.10.7 stabilizza la Mini B.I. dopo l'hotfix delle tab 0.10.6 e aggiunge controlli regressivi sui profili di accesso.

## Obiettivi

- Verificare che la pagina Mini B.I. resti coerente per profili diversi.
- Rendere testabile la matrice aree B.I. senza cambiare dati o regole Firestore.
- Mostrare nella pagina un riepilogo QA didattico delle aree previste per ruolo.
- Mantenere la panoramica adattiva e anti-leakage introdotta nel ramo 0.10.x.

## Profili verificati

La suite regressiva copre almeno:

- admin / superadmin;
- teacher / docente;
- vendite;
- acquisti;
- contabilità;
- magazzino;
- profilo limitato senza permessi B.I.

## Scelte conservative

Non sono state introdotte nuove collezioni Firestore. Non sono state modificate le regole Firestore, il backup/import/reset o la persistenza principale. I controlli restano lato UI e didattici: la protezione reale dei dati continua a dipendere dalle regole Firestore già documentate.

## Test

Test browser-based dedicato:

- `tests/mini-bi-0107.test.html`

Il test verifica la matrice ruoli, il rendering tab e la presenza del pannello QA nella pagina Mini B.I.
