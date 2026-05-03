# 105. Workflow approvativo operativo 0.12.11

## Scopo

La versione 0.12.11 chiarisce il rapporto tra documenti in bozza, Workflow approvativo e Segnalazioni operative.

Il flusso corretto non è creare una segnalazione per rendere valido un documento. Il flusso corretto è:

```text
Documento in Bozza
→ Analisi → Workflow approvativi
→ Approva
→ documento operativo/lavorabile
→ eventuale DDT, ricevimento merce, fatturazione o pagamento
→ Segnalazione operativa solo se emerge un’anomalia
```

## Ordini fornitore

Un ordine fornitore può nascere in `draft` / Bozza. Finché resta in bozza non viene proposto nel DDT fornitore ricevuto.

Per renderlo operativo:

```text
Analisi → Workflow approvativi
Filtro tipo: Ordini fornitore
Approva
```

L’approvazione aggiorna:

```text
workflowStatus = approved
approvalStatus = approved
status = confirmed
operationalStatus = confirmed
confirmedAt / confirmedBy
```

Da quel momento l’ordine appare tra gli ordini lavorabili nel ricevimento merce/DDT fornitore.

## Ordini cliente

Lo stesso principio vale per gli ordini cliente:

```text
Ordine cliente in Bozza
→ Workflow approvativi → Approva
→ status = confirmed
→ selezionabile nei DDT cliente
```

## DDT e ricevimento merce

I moduli DDT cliente/fornitore propongono solo ordini lavorabili, quindi confermati o parzialmente lavorati. Sono esclusi bozze, annullati, chiusi, ricevuti/evasI completamente.

## Segnalazioni operative

Le segnalazioni operative non sostituiscono il workflow approvativo. Servono per anomalie e comunicazioni interne, ad esempio:

- merce ricevuta e messa in quarantena;
- quantità diversa dall’ordine;
- DDT fornitore incompleto;
- prodotto non trovato in ubicazione;
- documento da verificare da parte di un reparto.

## Limiti

Il workflow resta applicativo/front-end e didattico. Non sostituisce firme digitali, protocolli aziendali reali o controlli fiscali/civilistici.
