# 106 - Segnalazioni operative 0.12.12: hotfix filtri elenco

La versione 0.12.12 corregge un problema della pagina **Workflow → Segnalazioni operative**.

## Problema corretto

Il riepilogo poteva mostrare segnalazioni aperte, ma l'elenco risultava vuoto perché a ogni render i filtri venivano ricostruiti e riportati a valori troppo restrittivi:

- Stato: Segnalata
- Area: Magazzino
- Gravità: Media

Questo rendeva poco comprensibile la pagina: i contatori indicavano dati presenti, ma la tabella non li mostrava.

## Comportamento corretto

All'apertura della pagina i filtri partono da:

- Stato: Aperte / da gestire
- Area: Tutte
- Gravità: Tutte

Quando l'utente modifica un filtro, il valore scelto viene mantenuto anche dopo refresh, apertura dettaglio, cambio stato o invio comunicazione.

## Impatto

- Nessuna nuova collezione Firestore.
- Nessuna modifica a regole Firestore.
- Nessuna Cloud Function.
- Nessun backend custom.
- Correzione solo UI/rendering e test.
