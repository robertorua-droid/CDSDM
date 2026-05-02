# Lotti / matricole / scadenze 0.2.4

La versione 0.2.4 introduce una tracciabilità didattica e opzionale per i prodotti fisici.

## Obiettivi

- Configurare per ogni prodotto fisico la modalità di tracciabilità: nessuna, lotto, matricola, lotto con scadenza.
- Consultare il registro **Magazzino → Lotti / matricole / scadenze**.
- Registrare manualmente un lotto, una matricola o una scadenza nella collezione opzionale `warehouseLots`.
- Evidenziare lotti attivi, in scadenza entro 30 giorni e scaduti.
- Esportare il registro in CSV.

## Compatibilità

I prodotti già esistenti vengono normalizzati con `trackingMode = none`. Le giacenze legacy continuano a funzionare come prima e non è richiesta alcuna migrazione dati obbligatoria.

## Persistenza

La nuova collezione Firestore è:

```text
users/{uid}/warehouseLots
```

La collezione è opzionale. Se vuota, il sistema può comunque leggere eventuali campi lotto già presenti nelle righe dei DDT fornitore.

## Campi principali

```js
{
  productId,
  lotCode,
  serialNumber,
  expiryDate,
  qtyAvailable,
  qtyQuarantine,
  supplierId,
  sourceDocumentNumber,
  status,
  notes
}
```

## Limiti didattici

La 0.2.4 non impone ancora il lotto nei flussi DDT cliente/fornitore. Il registro è operativo ma prudente: non modifica automaticamente la giacenza prodotto legacy e prepara le future evoluzioni su scarichi FIFO/FEFO e obbligatorietà per prodotto tracciato.
