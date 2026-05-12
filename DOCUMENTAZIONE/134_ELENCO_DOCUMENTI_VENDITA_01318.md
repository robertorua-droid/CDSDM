# 134 — Elenco documenti vendita 0.13.18

## Obiettivo

La versione **0.13.18** completa il lavoro di pulizia del menu Vendite accorpando fatture e note credito in una sola voce:

```text
Vendite → Elenco documenti vendita
```

L’obiettivo è ridurre il numero di voci dirette nel menu laterale e usare il modello già adottato per preventivi, ordini e DDT:

```text
Menu → elenco documento
Pagina → pulsanti Nuovo / azioni operative
```

## Cosa cambia nel menu

Prima erano presenti voci distinte:

```text
Vendite → Nuova Fattura
Vendite → Nuova Nota Credito
Vendite → Elenco Documenti
```

Ora la navigazione ordinaria usa:

```text
Vendite → Elenco documenti vendita
```

Dentro la pagina sono disponibili le azioni:

```text
Nuova fattura
Nuova nota credito
```

## Compatibilità

Le route tecniche legacy restano nel codice per non rompere collegamenti interni o funzioni già esistenti, ma non sono più voci visibili del menu operativo.

La 0.13.18 non modifica:

- Firestore;
- `firestore.rules`;
- collezioni;
- struttura dati;
- workflow approvativo;
- backup/import/reset, salvo aggiornamento `appVersion`;
- backend custom o Cloud Functions.

## Uso consigliato

Per consultare fatture e note credito:

```text
Vendite → Elenco documenti vendita
```

Per creare una fattura:

```text
Vendite → Elenco documenti vendita → Nuova fattura
```

Per creare una nota credito:

```text
Vendite → Elenco documenti vendita → Nuova nota credito
```
