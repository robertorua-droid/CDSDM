# 107 - UX segnalazioni, conversione preventivi e quantità 0.12.13

La versione 0.12.13 consolida tre aspetti operativi emersi dal collaudo.

## Preventivo cliente → Ordine cliente

Il preventivo può essere trasformato in ordine cliente solo quando è stato approvato/accettato.

Flusso consigliato:

1. creare il preventivo cliente;
2. approvarlo in **Analisi → Workflow approvativi** oppure impostarlo come accettato;
3. aprire il dettaglio preventivo;
4. usare **Crea ordine cliente**.

Il nuovo ordine nasce confermato e potrà proseguire verso DDT cliente e fattura secondo i flussi già esistenti.

## Quantità

Gli input quantità dei principali documenti commerciali/magazzino incrementano di default di 1, perché nella maggior parte dei casi si gestiscono pezzi interi. I valori decimali restano comunque accettati se inseriti manualmente, per casi come peso, metri, ore o unità frazionarie.

## Segnalazioni operative

La pagina **Workflow → Segnalazioni operative** ora separa:

- **Elenco e dettaglio**;
- **Nuova segnalazione**.

La separazione in tab evita che la tabella si restringa per la presenza del form laterale e rende più leggibili codice, stato, collegamento e azioni.
