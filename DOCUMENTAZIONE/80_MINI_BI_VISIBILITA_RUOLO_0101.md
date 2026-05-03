# 0.10.1 — Visibilità sezioni B.I. per ruolo

La pagina Mini B.I. mostra solo le aree consentite dal profilo corrente. Le tab non autorizzate sono nascoste/disabilitate e la pagina mostra un riepilogo dei permessi B.I. effettivi. Il controllo resta didattico lato client e non sostituisce le regole Firestore.

## Compatibilità

- Nessuna nuova collezione Firestore obbligatoria.
- Nessun backend custom.
- Nessuna Cloud Function richiesta.
- Compatibilità mantenuta con `users/{uid}` e `businessGroups/{groupId}`.
- Indicatori B.I. sempre didattici, prudenziali e non certificativi.
