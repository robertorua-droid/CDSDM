# 122 — Coerenza menu documenti commerciali 0.13.6

La versione **0.13.6** uniforma la navigazione dei documenti commerciali già esistenti, senza introdurre nuovi flussi applicativi.

## Obiettivo

La navigazione precedente mescolava due modelli:

- alcune funzioni avevano voce **Elenco** e voce **Nuovo** nel menu;
- altre funzioni, come i DDT, avevano una sola voce menu che apriva già l'elenco e conteneva il pulsante di creazione.

La 0.13.6 adotta il modello più prudente e mobile-friendly:

```text
Menu laterale → Elenco documento
Pagina       → pulsante Nuovo documento
```

## Voci interessate

### Vendite

- **Elenco Preventivi cliente** apre la vista dei preventivi e contiene il pulsante **Nuovo Preventivo cliente**.
- **Elenco Ordini cliente** apre la vista degli ordini cliente e contiene il pulsante **Nuovo Ordine cliente**.
- **Elenco DDT cliente** apre la vista dei DDT cliente e contiene il pulsante **Nuovo DDT cliente**.

### Acquisti

- **Elenco Ordini fornitore** apre la vista degli ordini fornitore e contiene il pulsante **Nuovo Ordine fornitore**.
- **Elenco DDT fornitore** apre la vista dei DDT fornitore e contiene il pulsante **Nuovo DDT fornitore**.

## Cosa non cambia

La release non modifica:

- collezioni Firestore;
- `firestore.rules`;
- compatibilità `users/{uid}`;
- compatibilità `businessGroups/{groupId}`;
- workflow approvativo;
- backup/import/reset;
- logiche di creazione, salvataggio o conversione dei documenti.

Le sezioni mantengono gli stessi `data-target` e gli stessi ID principali, così i collegamenti esistenti, i permessi UI e i test restano compatibili.

## Beneficio UX

Il menu laterale diventa più corto e coerente, specialmente su smartphone. L'utente consulta sempre l'elenco dal menu e crea nuovi documenti dal pulsante presente nella pagina.

## QA browser-based

La release aggiunge:

```text
tests/menu-documenti-commerciali-0136.test.html
```

Il test verifica:

- presenza delle voci `Elenco` nel menu;
- assenza delle vecchie voci `Nuovo` nel menu laterale per preventivi e ordini;
- presenza dei pulsanti `Nuovo` dentro le rispettive pagine;
- aggiornamento versione `0.13.6` e backup JSON;
- assenza di nuove collezioni Firestore dedicate.
