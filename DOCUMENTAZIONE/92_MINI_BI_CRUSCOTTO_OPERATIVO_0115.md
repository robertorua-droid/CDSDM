# MINI BI CRUSCOTTO OPERATIVO 0115

Versione: CDSDM 0.11.x

Questa scheda documenta l'evoluzione operativa della Mini B.I. didattica. La funzione resta interamente front-end, usa dati già disponibili in Firestore/AppStore/globalData e non introduce backend custom, Cloud Functions obbligatorie o nuove collezioni Firestore.

## Principi

- Indicatori didattici, gestionali e non certificativi.
- Calcoli browser-based, con soglie e avvisi per dataset grandi.
- Rispetto dei permessi B.I. introdotti nel ramo 0.10.x.
- Nessun dato aggregato deve essere mostrato quando l'area non è autorizzata.
- Ogni KPI espone fonti, formula semplificata e limiti.

## Funzioni rilevanti

- Drill-down sui KPI principali.
- Tabelle dettaglio filtrabili e ordinabili.
- Export CSV generato nel browser.
- Report HTML stampabile dal browser.
- Alert operativi non persistenti.
- Cruscotto operativo per area.
- QA performance e regressione permessi.

## Limiti

La Mini B.I. non sostituisce contabilità, bilancio civilistico/fiscale, controllo di gestione professionale o consulenza fiscale. I dati dipendono dalla qualità dei documenti inseriti e dalla loro corretta classificazione.
