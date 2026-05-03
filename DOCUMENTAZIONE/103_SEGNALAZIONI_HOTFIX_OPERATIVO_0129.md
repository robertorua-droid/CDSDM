# 0.12.9 — Hotfix operativo segnalazioni

La versione 0.12.9 rende più esplicito il flusso operativo di **Workflow → Segnalazioni operative**.

## Bozza e invio effettivo

La creazione distingue due azioni:

- **Salva bozza**: registra una segnalazione preparatoria con stato `draft`.
- **Invia segnalazione**: registra una segnalazione effettiva con stato `reported`, valorizza la data di invio e crea una prima comunicazione interna al reparto destinatario.

## Comunicazioni interne

Nel dettaglio della segnalazione il pulsante ora si chiama **Invia comunicazione**. Il messaggio viene aggiunto alla cronologia della scheda con reparto destinatario, autore, data e stato corrente.

## Transizioni guidate

La scheda espone pulsanti di workflow coerenti con lo stato corrente:

```text
Bozza → Invia segnalazione
Segnalata → Prendi in carico / Avvia lavorazione / Richiedi info
Assegnata o in lavorazione → Richiedi info / Risolvi
Risolta → Chiudi
```

La chiusura e l'annullamento restano riservati a profili con permessi adeguati secondo la policy esistente.

## Caso merce in quarantena

Per simulare una ricezione merce con quarantena, si può creare una segnalazione di tipo **Merce ricevuta messa in quarantena**, origine **Magazzino**, destinatario **Acquisti** o **Direzione**, e usare **Invia segnalazione** per generare la comunicazione interna iniziale.

## Note tecniche

Non sono state aggiunte nuove collezioni. La collezione resta `operationalReports`; backup/import/reset e compatibilità `users/{uid}` / `businessGroups/{groupId}` restano invariati.
