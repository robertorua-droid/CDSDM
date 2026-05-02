# Bilancino gestionale — versione 0.4.5

La release 0.4.5 introduce in **Contabilità → Bilancino** un prospetto gestionale semplificato per leggere l'andamento economico e finanziario dell'attività senza costruire un bilancio civilistico completo.

## Obiettivo

Il bilancino risponde a domande operative:

- quanto è stato fatturato nel periodo;
- quali costi sono stati sostenuti;
- qual è il margine operativo semplificato;
- quali incassi e pagamenti sono stati registrati;
- quanti crediti clienti e debiti fornitori restano aperti;
- qual è il valore stimato del magazzino.

## Fonti dati

La vista legge dati già esistenti:

```text
invoices
purchases
notes / note di credito
paymentEvents
cashbookMovements
products
supplierDDTs
businessBudgets
```

Non introduce nuove collezioni Firestore e non richiede migrazioni.

## Sezioni

### Conto economico semplificato

- ricavi da fatture cliente;
- note di credito cliente;
- ricavi netti;
- costi da acquisti;
- costi manuali di prima nota;
- margine operativo semplificato.

### Situazione finanziaria

- incassi cliente;
- pagamenti fornitore;
- entrate manuali;
- uscite manuali;
- saldo finanziario del periodo.

### Crediti e debiti aperti

- crediti clienti aperti;
- debiti fornitori aperti;
- saldo netto aperti;
- scaduto clienti/fornitori.

### Magazzino stimato

Il valore magazzino è mostrato separatamente e può usare i metodi già introdotti nella valorizzazione magazzino:

- prezzo anagrafico;
- ultimo costo DDT fornitore;
- costo medio ponderato semplificato.

## Limiti dichiarati

Il bilancino è gestionale e didattico. Non include:

- ammortamenti;
- imposte;
- ratei e risconti;
- scritture di assestamento;
- schemi di bilancio civilistici;
- liquidazioni fiscali ufficiali.

## Moduli

```text
js/features/accounting/mini-balance-service.js
js/features/accounting/mini-balance-module.js
```

## Test

```text
tests/mini-balance-045.test.html
```
