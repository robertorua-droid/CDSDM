# 12. Valorizzazione magazzino 0.2.3

La versione 0.2.3 evolve la sezione **Magazzino → Inventario** in una vista di **Valorizzazione magazzino**.

La funzione resta coerente con l'architettura del progetto:

- single-page app solo front-end;
- dati salvati per utente su Firebase/Firestore;
- nessuna nuova collezione Firestore;
- nessun backend applicativo custom;
- calcoli derivati da `products` e `supplierDDTs` già esistenti;
- compatibilità con i prodotti legacy tramite fallback al prezzo anagrafico.

## Metodi disponibili

### Prezzo anagrafico

Usa il prezzo di acquisto salvato nella scheda prodotto (`purchasePrice`). È il metodo più semplice e resta il fallback per i prodotti senza storico DDT fornitore.

### Ultimo costo DDT fornitore

Usa l'ultimo prezzo rilevato nelle righe dei DDT fornitore ricevuti. Sono considerati solo i DDT di ricevimento, non i DDT di reso fornitore o documenti annullati.

### Costo medio ponderato semplificato

Calcola una media ponderata sui DDT fornitore ricevuti usando quantità accettate e quantità in quarantena. È un metodo didattico semplificato: non sostituisce una contabilità industriale completa, ma permette di confrontare il valore anagrafico con il valore derivato dagli acquisti effettivi.

## UI

La vista mostra:

- valore disponibile;
- valore in quarantena;
- valore totale;
- prodotti sotto scorta;
- costo unitario usato;
- origine del costo;
- note su costo mancante, fallback, quarantena e sotto scorta.

I filtri permettono di isolare:

- tutti i prodotti fisici;
- solo prodotti con giacenza o quarantena;
- solo prodotti sotto scorta;
- solo prodotti senza costo valorizzabile;
- solo prodotti con costo fallback.

## Export CSV

L'export CSV include metodo, costo unitario, costo standard, ultimo costo, costo medio, origine costo e valori calcolati. Il file resta generato interamente lato browser.
