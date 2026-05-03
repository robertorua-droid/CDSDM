# 0.10.0 — Matrice permessi B.I. basata sui moduli esistenti

La Mini B.I. introduce una mappa prudente tra viste B.I. e permessi già presenti. Non vengono create nuove collezioni Firestore e non si introducono permessi separati obbligatori. Le viste leggono i dati dei moduli già autorizzati: Vendite usa vendite/fatture/clienti, Acquisti usa acquisti/fornitori, Contabilità usa accounting, Magazzino usa warehouse/products, Didattica usa docente/simulazioni/report.

## Compatibilità

- Nessuna nuova collezione Firestore obbligatoria.
- Nessun backend custom.
- Nessuna Cloud Function richiesta.
- Compatibilità mantenuta con `users/{uid}` e `businessGroups/{groupId}`.
- Indicatori B.I. sempre didattici, prudenziali e non certificativi.
