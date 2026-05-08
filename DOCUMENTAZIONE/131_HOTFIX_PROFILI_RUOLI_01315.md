# 131 — Hotfix profili permesso e ruolo informativo 0.13.15

## Obiettivo

La versione **0.13.15** corregge una regressione nell’area permessi emersa dopo la 0.13.14.

## Correzioni

- **Profili permesso** non va più in errore quando il catalogo ruoli è esposto come oggetto (`BusinessGroupsService.ROLES`).
- **Ruoli e permessi** in modalità Gruppo aziendale diventa esplicitamente informativa: mostra il ruolo corrente come valore bloccato, evitando l’impressione che il superadmin possa modificare il proprio ruolo da quella pagina.
- La modifica reale dei privilegi resta centralizzata in:
  - **Gruppi aziendali** per membership/ruolo;
  - **Profili permesso** per assegnazione profilo operativo.

## Compatibilità

La 0.13.15 non modifica Firestore rules, collezioni, inviti, backend o Cloud Functions.
