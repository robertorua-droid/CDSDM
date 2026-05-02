# 10. Dashboard Direzionale

Versione 0.2.1 introduce la **Dashboard Direzionale** come prima evoluzione funzionale del ramo 0.2.x.

## Cosa mostra

- Fatturato netto del periodo, con note di credito incluse.
- Acquisti/costi del periodo.
- Margine lordo stimato.
- Scadenze clienti e fornitori aperte/scadute.
- Valore magazzino disponibile, in quarantena e totale.
- Numero di DDT cliente ancora da fatturare.
- Ordini cliente e fornitore aperti.
- Ore timesheet fatturabili non ancora collegate a fattura.
- Andamento per mese o giorno, top clienti e alert operativi.

## Note tecniche

La dashboard usa `ExecutiveDashboardService` e legge i dati già presenti in `AppStore`/`globalData`. Non introduce nuove collezioni Firestore, non richiede backend custom e non modifica i normalizzatori esistenti.

## Uso

Apri **Analisi → Dashboard**, scegli vista annuale o mensile, anno/mese e premi **Aggiorna** se necessario.
