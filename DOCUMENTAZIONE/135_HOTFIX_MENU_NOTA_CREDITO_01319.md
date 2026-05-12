# 135 — Hotfix menu Nota di Credito 0.13.19

## Obiettivo

La versione **0.13.19** corregge una regressione di visibilità introdotta dopo l'accorpamento dei documenti vendita.

La voce diretta:

```text
Vendite → Nuova Nota Credito
```

non deve comparire nel menu operativo. La creazione della nota credito deve avvenire da:

```text
Vendite → Elenco documenti vendita → Nuova nota credito
```

## Problema corretto

In 0.13.18 la voce legacy era marcata come nascosta nel markup, ma `PermissionsPolicy.applyUiRestrictions()` ricalcolava le voci accessibili in base al ruolo e poteva rimuovere la classe `d-none` dagli elementi con `data-target` autorizzato.

Effetto osservabile: per utenti con permessi sul modulo vendite, la voce **Nuova Nota Credito** poteva riapparire nel menu laterale.

## Correzione

La 0.13.19 introduce un guard rail esplicito per gli elementi marcati con:

```text
data-menu-legacy="sales-document-action"
```

Questi elementi vengono mantenuti nascosti anche dopo il ricalcolo dei permessi UI.

È stata aggiunta anche una protezione CSS prudente:

```text
.sidebar [data-menu-legacy]
```

così le azioni legacy non riappaiono per effetto di altri refresh dell'interfaccia.

## Comportamento atteso

Nel menu **Vendite** devono essere visibili le voci operative di elenco, tra cui:

```text
Elenco documenti vendita
```

Non devono essere visibili come voci dirette:

```text
Nuova Fattura
Nuova Nota Credito
```

Le azioni restano disponibili nella pagina:

```text
Vendite → Elenco documenti vendita
```

tramite i pulsanti:

```text
Nuova fattura
Nuova nota credito
```

## Impatto tecnico

La release non modifica:

- collezioni Firestore;
- `firestore.rules`;
- struttura dati;
- workflow approvativo;
- gestione gruppi, inviti, membri o profili;
- backup/import/reset, salvo aggiornamento del riferimento `appVersion`;
- backend custom;
- Cloud Functions obbligatorie.

## Compatibilità

Le route tecniche e il form documento restano disponibili per compatibilità interna. La correzione riguarda solo la visibilità del menu laterale.

## Test

Aggiunto il test browser-based:

```text
tests/menu-nota-credito-hotfix-01319.test.html
```

Il test verifica:

- versione in-app 0.13.19;
- `appVersion` backup 0.13.19;
- presenza della voce unica **Elenco documenti vendita**;
- marcatura legacy nascosta delle azioni dirette;
- guard rail in `PermissionsPolicy`;
- protezione CSS per `[data-menu-legacy]`;
- assenza di modifiche a Firestore rules e nuove collezioni.
