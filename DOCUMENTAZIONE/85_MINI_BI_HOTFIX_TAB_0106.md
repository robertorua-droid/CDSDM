# 85. Mini B.I. 0.10.6 — Hotfix tab e rendering aree

La release 0.10.6 corregge una regressione della pagina **Analisi → Mini B.I. didattica**: in alcuni casi il riepilogo permessi indicava correttamente le aree visibili, ma il click sulle tab operative non aggiornava il contenuto dell'area.

## Correzioni

- Il modulo `miniBI` viene ora collegato anche nella procedura generale `bindEventListeners`.
- La funzione `render()` richiama comunque `bind()` in modo difensivo, così la navigazione verso la pagina Mini B.I. inizializza sempre i click delle tab.
- Le tab operative mantengono una sola area attiva alla volta.
- Se una tab viene nascosta dai permessi, viene selezionata automaticamente la prima area disponibile.
- Ogni area mostra sempre card KPI oppure un messaggio didattico di assenza dati.

## Impatto dati

Nessuna modifica a Firestore, regole, collezioni, backup/import/reset o Cloud Functions.

## Test

Aggiunto `tests/mini-bi-0106.test.html` per verificare il cambio tab e il rendering dell'area selezionata.
