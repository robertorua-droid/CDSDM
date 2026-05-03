# 0.10.4 — Audit consultazione B.I. sensibile opzionale

È stata predisposta una funzione di costruzione evento audit per consultazioni Mini B.I. L’audit è disattivato di default e non persiste automaticamente nulla. Può essere abilitato solo in modo esplicito impostando CDSDM_MINI_BI_AUDIT_ENABLED=true e usando infrastrutture esistenti.

## Compatibilità

- Nessuna nuova collezione Firestore obbligatoria.
- Nessun backend custom.
- Nessuna Cloud Function richiesta.
- Compatibilità mantenuta con `users/{uid}` e `businessGroups/{groupId}`.
- Indicatori B.I. sempre didattici, prudenziali e non certificativi.
