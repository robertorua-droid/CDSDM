# 37. Controllo concorrenza e scritture sicure 0.5.4

La versione **0.5.4** introduce le prime protezioni applicative per lavorare in più utenti sullo stesso **Gruppo aziendale** senza rendere fragile la persistenza didattica front-end.

## Obiettivi

- aggiungere metadata standard alle scritture: `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `docVersion`, `writePolicyVersion`;
- usare transazioni Firestore per salvataggi singoli, batch e cancellazioni;
- predisporre controllo ottimistico tramite `docVersion`;
- esporre lock leggero con scadenza per operazioni critiche future;
- supportare idempotenza opzionale tramite `_idempotencyKey` / `idempotencyKey`;
- registrare conflitti in `businessGroups/{groupId}/auditEvents` quando possibile;
- non cancellare né migrare forzatamente dati legacy.

## Nuovo modulo

- `js/core/concurrency-service.js`

Il servizio è caricato prima di `firebase-cloud.js` e viene usato dalle funzioni comuni:

- `saveDataToCloud(collection, data, id)`;
- `batchSaveDataToCloud(collection, updates)`;
- `deleteDataFromCloud(collection, id)`.

## Versionamento ottimistico

Ogni documento salvato tramite il canale comune riceve un campo numerico `docVersion` incrementale.

Quando un modulo passa un valore atteso, per esempio:

```js
saveDataToCloud('products', { ...product, _expectedDocVersion: product.docVersion }, product.id)
```

il servizio legge il documento dentro una transazione e blocca il salvataggio se la versione remota è cambiata.

Per compatibilità, i moduli esistenti che non passano ancora `_expectedDocVersion` continuano a funzionare: la 0.5.4 prepara il terreno senza imporre una migrazione invasiva su tutte le schermate.

## Lock leggero

Il servizio espone:

- `ConcurrencyService.acquireLock(rootRef, collection, id, { ttlMs })`;
- `ConcurrencyService.releaseLock(rootRef, collection, id, token)`.

I lock sono salvati in:

```text
businessGroups/{groupId}/documentLocks/{collection}__{docId}
```

oppure nello spazio legacy attivo. I lock hanno proprietario, token e scadenza. Sono pensati per operazioni ad alto rischio che saranno rafforzate progressivamente.

## Idempotenza

Le scritture possono passare una chiave idempotente. Se il documento ha già la stessa `lastIdempotencyKey`, il servizio considera la scrittura già applicata e non la ripete.

## Firestore Rules

`firestore.rules` è stato aggiornato per documentare e consentire la sottocollezione:

```text
businessGroups/{groupId}/documentLocks
```

Un membro attivo può creare/aggiornare un lock proprio o scaduto; il rilascio è consentito al proprietario del lock.

## Limiti dichiarati

La 0.5.4 non trasforma ancora ogni singola procedura gestionale in operazione atomica completa. Alcuni flussi complessi, come movimenti di magazzino collegati a DDT o riconciliazioni con più documenti, continuano a usare più salvataggi coordinati. La base transazionale comune riduce il rischio e prepara il consolidamento successivo.

## Impatto sui dati

Non vengono cancellati dati personali legacy. I nuovi campi sono aggiuntivi e compatibili con backup/import/reset.
