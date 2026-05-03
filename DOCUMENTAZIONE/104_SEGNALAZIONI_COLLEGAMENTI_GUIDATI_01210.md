# 104. Segnalazioni operative 0.12.10 — Collegamenti guidati e quarantena

La versione 0.12.10 migliora l'uso operativo delle segnalazioni.

## Bozza e segnalazione effettiva

Una segnalazione creata con **Salva bozza** non è ancora una comunicazione operativa effettiva. Serve per preparare il caso, completare descrizione, destinatario, documento collegato e azione richiesta.

Per renderla effettiva bisogna aprire il dettaglio e premere **Invia segnalazione**. In quel momento lo stato diventa **Segnalata** e viene creata una comunicazione interna verso il reparto destinatario.

Flusso consigliato:

```text
Bozza → Invia segnalazione → Segnalata → Prendi in carico → Avvia lavorazione → Risolta → Chiusa
```

## Collegamento guidato a documenti

Nel form è presente il blocco **Collegamento guidato a documenti operativi**. Per gli ordini fornitore vengono proposti solo documenti in stato lavorabile/approvato.

Sono considerati lavorabili:

```text
approved, confirmed, partially_received, open, in_progress
```

Sono esclusi:

```text
draft, cancelled, deleted, rejected, not_approved, received, closed, archived
```

Questo evita di collegare una segnalazione a ordini eliminati, non approvati o già conclusi.

## DDT fornitore e quarantena

Nel dettaglio DDT fornitore, se ci sono quantità in quarantena, compare il pulsante **Segnala quarantena**. Il pulsante crea una bozza precompilata in **Workflow → Segnalazioni operative** con:

- tipo: merce ricevuta messa in quarantena;
- origine: magazzino;
- destinatario: acquisti;
- documento collegato: DDT fornitore;
- azione richiesta: verifica con fornitore e decisione operativa.

La bozza deve poi essere inviata manualmente con **Invia segnalazione**.

## Limiti

La funzione resta front-end e usa Firestore come persistenza principale. Non richiede backend custom o Cloud Functions.
