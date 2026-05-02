# 14. Import massivi CSV 0.2.5

La versione 0.2.5 introduce una sezione dedicata agli import massivi da CSV, coerente con l’architettura del progetto:

- single-page app solo front-end;
- nessun backend applicativo custom;
- persistenza su Firebase/Firestore tramite le funzioni già esistenti;
- anteprima e validazione prima del salvataggio;
- compatibilità con normalizzatori di dominio e dati legacy.

## Dove si trova

La funzione è disponibile in:

```text
Impostazioni → Import massivi CSV
```

## Entità supportate

La release 0.2.5 supporta import di:

- clienti;
- fornitori;
- servizi / prodotti / costi;
- lotti / matricole / scadenze;
- movimenti magazzino.

## Flusso operativo

1. Seleziona il tipo dati da importare.
2. Scarica il template CSV corrispondente.
3. Compila il file in formato CSV UTF-8.
4. Carica il file.
5. Genera l’anteprima.
6. Verifica righe valide ed errori.
7. Conferma l’import solo quando tutte le righe sono valide.

Nessun dato viene scritto su Firestore prima della conferma finale.

## Excel

Per mantenere il progetto leggero e coerente con l’approccio didattico, la 0.2.5 non introduce librerie esterne per leggere direttamente file `.xlsx`.

I file Excel devono essere salvati come CSV UTF-8 prima dell’import.

## ID e aggiornamenti

Se il CSV contiene una colonna `id`, il sistema usa quell’ID e aggiorna l’elemento esistente se già presente.

Se l’ID è assente, viene assegnato un ID numerico progressivo evitando conflitti con gli ID già presenti nella collezione.

## Validazione

La validazione blocca l’import in presenza di righe errate. Esempi:

- prodotto senza descrizione;
- lotto senza `productId`;
- lotto senza lotto o matricola;
- movimento magazzino senza prodotto;
- movimento magazzino con quantità zero o negativa.

## Limiti didattici

L’import CSV 0.2.5 è pensato per caricamenti controllati. Non esegue deduplicazioni avanzate per partita IVA, descrizione o codice prodotto; in caso di aggiornamento massivo è consigliato indicare sempre la colonna `id`.
