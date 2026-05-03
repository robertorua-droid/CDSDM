# 69. Consolidamento dati, store e report 0.8.12

La versione **0.8.12** è un rilascio prudente di consolidamento tecnico prima del ramo mini B.I. 0.9.x.

Non introduce nuove collezioni Firestore, non richiede backend custom e non rende obbligatorie Cloud Functions. La persistenza principale resta Firestore, con compatibilità legacy `users/{uid}` e gruppi `businessGroups/{groupId}`.

## Obiettivi

- correggere l'incoerenza dell'indice test browser-based, che mostrava ancora un badge 0.7.5;
- ridurre la duplicazione della lista `CDSDM_DATA_COLLECTIONS`;
- rendere `AppStore.ensureGlobalData()` coerente con la fonte ufficiale delle collezioni;
- mantenere backup, import e reset allineati alle collezioni reali;
- chiarire il ruolo storico di `Report gestionali` rispetto a dashboard, budget, bilancino e futura mini B.I.

## Fonte ufficiale collezioni dati

La fonte applicativa ufficiale resta:

```text
js/core/domain-constants.js
```

Il file espone:

```text
DomainConstants.DATA_COLLECTIONS
window.CDSDM_DATA_COLLECTIONS
window.getCDSDMDataCollections()
```

I moduli che caricano, esportano, importano o resettano i dati devono usare questa fonte comune invece di mantenere copie locali della lista.

## AppStore e globalData

`js/core/app-store.js` inizializza ora `globalData` leggendo la lista ufficiale delle collezioni, mantenendo `companyInfo` come oggetto separato.

Questo prepara il progetto a moduli futuri di lettura trasversale, come la mini B.I., senza duplicare l'elenco delle collezioni in più punti.

## Backup, import e reset

La versione 0.8.12 non cambia il formato logico del backup, ma aggiorna il riferimento versione a `0.8.12` e mantiene le operazioni agganciate a `CDSDM_DATA_COLLECTIONS`.

Le collezioni operative restano le stesse della 0.8.11.

## Report gestionali e futura mini B.I.

La voce **Analisi → Report gestionali** resta una vista trasversale operativa. Il modulo storico che la implementa nasce nell'area magazzino, ma oggi contiene anche controlli su documenti, scadenze e flussi gestionali.

Per evitare regressioni, la 0.8.12 non rinomina file o namespace esistenti. Il chiarimento è documentale e architetturale: la futura mini B.I. dovrà riusare dove opportuno dashboard, report gestionali, budget e bilancino, senza duplicarli.

## Test

È stato aggiunto il test browser-based:

```text
tests/consolidamento-0812.test.html
```

Il test verifica:

- presenza di `getCDSDMDataCollections()`;
- allineamento tra `DomainConstants.DATA_COLLECTIONS` e `CDSDM_DATA_COLLECTIONS`;
- inizializzazione di `AppStore/globalData` per tutte le collezioni ufficiali;
- assenza di copie lunghe della lista collezioni nei moduli principali consolidati;
- versione backup `0.8.12`;
- aggiornamento indice test, README, changelog e schermata versione.
