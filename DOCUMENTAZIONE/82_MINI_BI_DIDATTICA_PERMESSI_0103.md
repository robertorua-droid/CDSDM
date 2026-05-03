# 0.10.3 — Permessi avanzati docente/simulazione

La vista Didattica resta disponibile per admin/docente o profili con accesso a console docente, QA/migrazione o report/simulazioni. Questo consente scenari in aula senza esporre dati gestionali non coerenti con il ruolo.

## Compatibilità

- Nessuna nuova collezione Firestore obbligatoria.
- Nessun backend custom.
- Nessuna Cloud Function richiesta.
- Compatibilità mantenuta con `users/{uid}` e `businessGroups/{groupId}`.
- Indicatori B.I. sempre didattici, prudenziali e non certificativi.
