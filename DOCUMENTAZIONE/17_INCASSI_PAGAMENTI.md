# Incassi e pagamenti evoluti 0.3.1

La versione 0.3.1 introduce un registro finanziario operativo per incassi cliente e pagamenti fornitore.

## Dove si trova

```text
Contabilità → Incassi e pagamenti
```

## Funzioni principali

- registrazione di incassi cliente;
- registrazione di pagamenti fornitore;
- importo, data movimento, data valuta, metodo, riferimento e note;
- allocazione del movimento su uno o più documenti aperti;
- visualizzazione dei movimenti da nuova collezione `paymentEvents` e da pagamenti legacy presenti nei documenti;
- export CSV dei movimenti filtrati.

## Persistenza

La release introduce la collezione opzionale:

```text
users/{uid}/paymentEvents
```

Ogni evento contiene:

```js
{
  id,
  type: "customer_receipt" | "supplier_payment",
  subjectType: "customer" | "supplier",
  subjectId,
  date,
  valueDate,
  amount,
  method,
  reference,
  notes,
  allocations: [
    { documentType, documentId, documentNumber, amount }
  ]
}
```

Per compatibilità con lo scadenzario e il partitario, il movimento viene anche rispecchiato negli array `payments` dei documenti allocati con `paymentEventId`.

## Compatibilità dati

- I pagamenti legacy già presenti negli array `payments` restano leggibili.
- Il partitario 0.3.0 legge anche `paymentEvents` 0.3.1 senza duplicare i mirror sui documenti.
- Lo scadenzario considera gli eventi allocati quando calcola pagato/incassato e residuo.

## Limiti didattici

La funzione non è ancora una riconciliazione bancaria completa e non genera scritture contabili di prima nota. Prepara però le release successive su prima nota, estratto conto e riconciliazione pagamenti.
