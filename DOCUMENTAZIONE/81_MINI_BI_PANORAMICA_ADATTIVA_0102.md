# 0.10.2 — Panoramica B.I. adattiva e anti-leakage

La panoramica Mini B.I. ora adatta le card ai permessi disponibili. Un utente non autorizzato alla Direzione non riceve automaticamente KPI trasversali come margine o fatturato complessivo. Gli aggregati vengono mostrati solo se coerenti con le aree consentite.

## Compatibilità

- Nessuna nuova collezione Firestore obbligatoria.
- Nessun backend custom.
- Nessuna Cloud Function richiesta.
- Compatibilità mantenuta con `users/{uid}` e `businessGroups/{groupId}`.
- Indicatori B.I. sempre didattici, prudenziali e non certificativi.
