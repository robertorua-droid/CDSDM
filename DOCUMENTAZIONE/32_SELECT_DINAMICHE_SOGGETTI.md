# Select dinamiche soggetti — versione 0.4.8

La release 0.4.8 corregge il popolamento delle combo dinamiche usate in alcune sezioni contabili.

## Problema rilevato

In **Contabilità → Incassi e pagamenti**, la combo **Soggetto** poteva restare ferma al solo valore:

```text
Seleziona...
```

anche quando erano presenti clienti o fornitori in anagrafica.

La causa era un controllo di inizializzazione troppo debole: il modulo verificava solo se la select avesse opzioni. Poiché nel markup era già presente un placeholder statico, il popolamento dinamico non partiva.

## Correzione

I moduli ora distinguono tra:

- select vuota;
- select con solo placeholder;
- select già popolata realmente.

Quando la select contiene solo il placeholder, il modulo richiama il popolamento dinamico.

## Sezioni consolidate

- **Contabilità → Incassi e pagamenti**
- **Contabilità → Partitario**
- **Contabilità → Estratto conto**
- **Analisi → Stampe / PDF**

## Comportamento atteso

In **Incassi e pagamenti**:

```text
Incasso cliente      → elenco clienti
Pagamento fornitore  → elenco fornitori
```

Dopo la scelta del soggetto, il modulo mostra i documenti aperti allocabili, se presenti. Se il soggetto non ha documenti aperti, la combo resta comunque popolata e viene mostrato un messaggio dedicato.

## Controllo UX

La sezione **Analisi → UX / accessibilità** include un controllo consultivo sulle select dinamiche più critiche, per evidenziare eventuali combo rimaste ferme al solo placeholder.

## File principali

```text
js/features/accounting/payment-events-module.js
js/features/accounting/ledger-module.js
js/features/accounting/account-statement-module.js
js/features/accounting/print-center-module.js
js/ui/accessibility-ux-service.js
tests/dynamic-selects-048.test.html
```

## Limiti

La release non crea dati dimostrativi: se non esistono clienti, fornitori o documenti, le select possono mostrare solo il placeholder o la voce “Tutti”, ma questo riflette l’assenza reale di dati.
