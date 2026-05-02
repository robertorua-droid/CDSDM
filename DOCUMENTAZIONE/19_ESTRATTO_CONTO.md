# Estratto conto cliente/fornitore 0.3.3

La versione 0.3.3 introduce la sezione **Contabilità → Estratto conto**.

## Obiettivo

L'estratto conto riusa i movimenti del partitario per costruire una vista di periodo più adatta alla consultazione e alla stampa:

- saldo iniziale prima del periodo selezionato;
- movimenti del periodo;
- dare e avere del periodo;
- saldo progressivo ricalcolato dal saldo iniziale;
- saldo finale;
- export CSV;
- stampa HTML tramite browser.

## Origine dati

La funzione è una vista derivata e non introduce nuove collezioni Firestore. Legge:

- `invoices`;
- `purchases`;
- `paymentEvents`;
- pagamenti legacy negli array `payments` dei documenti;
- anagrafiche `customers` e `suppliers`.

## Logica clienti

Per i clienti:

- fatture = dare;
- note di credito e incassi = avere;
- saldo positivo = credito residuo verso il cliente.

## Logica fornitori

Per i fornitori:

- acquisti = avere;
- rettifiche e pagamenti = dare;
- saldo positivo = debito residuo verso il fornitore.

## Compatibilità

L'estratto conto non modifica dati e non richiede migrazioni. I movimenti sono ricostruiti dal `LedgerService` e dai dati già normalizzati nelle release precedenti.

## Limiti didattici

Non è un estratto conto fiscalmente certificato e non sostituisce la contabilità generale. È una vista gestionale realistica per controllo operativo, stampa e confronto con clienti/fornitori.
