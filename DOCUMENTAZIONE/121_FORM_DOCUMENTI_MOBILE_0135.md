# 121 — Form complessi e documenti gestionali mobile-aware 0.13.5

La versione **0.13.5** conclude il primo ciclo mobile 0.13.x con un intervento prudente sui **form complessi** e sui **documenti gestionali**.

L'obiettivo non è trasformare lo smartphone nello strumento principale per compilare documenti lunghi, ma rendere più ordinata la consultazione e la compilazione di modifiche brevi.

## Obiettivo

Migliorare l'usabilità mobile di aree come:

- fatture e note di credito;
- preventivi;
- ordini cliente e fornitore;
- DDT cliente e fornitore;
- acquisti;
- movimenti, inventari e lotti di magazzino.

La release resta esclusivamente front-end e non modifica la persistenza.

## Intervento tecnico

È stato aggiunto il servizio UI:

```text
js/ui/mobile-documents-service.js
```

Il servizio:

- riconosce le sezioni documentali principali già presenti in `index.html`;
- aggiunge classi CSS progressive a form, card, modali, pulsanti, tabelle e gruppi di azioni;
- mostra un suggerimento mobile nelle pagine documentali;
- usa `MutationObserver` per intercettare contenuti generati dinamicamente;
- espone `window.MobileDocumentsService` per test e QA.

## Cosa cambia per l'utente

Su smartphone:

- i campi form hanno spaziatura e altezza più adatte al touch;
- i pulsanti sono più distanziati;
- i gruppi di azioni evitano compressioni eccessive;
- modali e footer risultano più leggibili;
- tabelle e righe documentali cooperano con il servizio responsive 0.13.2;
- viene ricordato che i documenti con molte righe restano preferibili da desktop/tablet.

## Cosa non cambia

La 0.13.5 non introduce:

- nuove collezioni Firestore;
- nuove regole Firestore;
- nuove voci di menu;
- nuovi workflow;
- nuove logiche dati;
- backend custom;
- Cloud Functions obbligatorie.

Non modifica il significato operativo dei documenti. Bozze, approvazioni, DDT, acquisti, fatture e movimenti restano governati dai moduli già esistenti.

## Uso consigliato da smartphone

Uso adatto:

1. consultare lo stato di un documento;
2. verificare righe e importi;
3. correggere campi brevi;
4. controllare allegamenti o collegamenti;
5. usare workflow, segnalazioni e Mini B.I. come già ottimizzati nelle versioni 0.13.3 e 0.13.4.

Uso ancora consigliato da desktop/tablet:

- compilazione di documenti con molte righe;
- import/export XML o CSV;
- stampa finale;
- configurazione permessi;
- audit sicurezza avanzato;
- analisi Mini B.I. estesa.

## Test

La release aggiunge:

```text
tests/mobile-form-documenti-0135.test.html
```

Il test verifica:

- presenza del servizio `mobile-documents-service.js`;
- caricamento del servizio da `index.html`;
- versione `0.13.5`;
- presenza CSS mobile dedicato;
- aggiornamento backup JSON;
- aggiornamento documentale;
- assenza di nuove collezioni Firestore.
