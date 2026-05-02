# Budget, costi e marginalità 0.3.6

La versione 0.3.6 introduce la sezione **Analisi → Budget e marginalità**.

## Obiettivo

La funzione permette di confrontare i consuntivi dell'anno con un budget mensile:

- ricavi da fatture cliente;
- costi da acquisti fornitore;
- costi manuali da prima nota;
- margine lordo stimato;
- marginalità percentuale;
- top clienti, prodotti/servizi e fornitori.

## Persistenza

La release introduce la collezione opzionale:

```text
users/{uid}/businessBudgets
```

La collezione salva solo i target di budget annuali. I consuntivi restano derivati dai dati già presenti nel gestionale.

## Modello dati

Ogni budget annuale usa un documento con id `budget_YYYY`:

```js
{
  id: "budget_2026",
  year: 2026,
  name: "Budget 2026",
  months: [
    { month: 1, revenueTarget: 0, costTarget: 0, marginTarget: 0, notes: "" }
  ],
  notes,
  createdAt,
  updatedAt
}
```

## Architettura

Nuovi file:

- `js/features/accounting/business-budget-service.js`;
- `js/features/accounting/business-budget-module.js`.

Il servizio calcola viste derivate da fatture, acquisti, prodotti, clienti, fornitori e movimenti manuali di prima nota. Non introduce backend custom.

## Limiti didattici

La marginalità è una stima gestionale, non una contabilità industriale completa. I costi prodotto sono stimati usando i dati anagrafici disponibili e i costi documentali; eventuali logiche più evolute possono essere collegate in futuro alla valorizzazione magazzino e ai lotti.
