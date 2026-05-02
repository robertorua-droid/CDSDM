# Riconciliazione pagamenti 0.3.5

La versione 0.3.5 introduce la sezione **Contabilità → Riconciliazione banca**.

## Obiettivo

La funzione consente di importare movimenti bancari in formato CSV e generare proposte di abbinamento con documenti aperti già presenti nel gestionale:

- fatture cliente aperte o parziali;
- acquisti/fornitori aperti o parziali;
- incassi e pagamenti già registrati tramite `paymentEvents`;
- pagamenti legacy presenti negli array `payments` dei documenti.

## Funzionamento

Il flusso operativo è prudente:

1. l'utente carica o incolla un CSV bancario;
2. il parser client-side normalizza data, data valuta, importo, conto, riferimento e causale;
3. il servizio propone abbinamenti usando importo, soggetto, numero documento e causale;
4. l'utente conferma manualmente ogni riga;
5. la conferma crea un evento in `paymentEvents` e registra lo storico in `bankReconciliationEvents`.

Nessun movimento viene salvato automaticamente.

## Colonne CSV supportate

Sono riconosciuti alias comuni:

- `data`, `dataContabile`, `dataMovimento`, `date`;
- `dataValuta`, `valuta`, `valueDate`;
- `importo`, `amount`, oppure coppie `entrata`/`uscita`, `avere`/`dare`, `credit`/`debit`;
- `conto`, `banca`, `account`, `iban`;
- `riferimento`, `cro`, `trn`, `transactionId`;
- `descrizione`, `causale`, `description`, `note`.

## Persistenza

La release introduce la collezione opzionale Firestore:

```text
bankReconciliationEvents
```

Questa collezione contiene solo lo storico delle righe bancarie confermate. L'evento finanziario operativo resta in `paymentEvents`.

## Compatibilità

La funzione non richiede migrazioni obbligatorie. I dati esistenti continuano a funzionare e vengono letti tramite i servizi già presenti.

## Limiti didattici

La riconciliazione è assistita ma non automatica. Il matching non sostituisce un controllo contabile reale e va sempre confermato dall'utente.
