## CDSDM Versione 0.4.8 — Correzione select dinamiche soggetti

La versione 0.4.8 è una release mirata di consolidamento UX/funzionale: corregge il popolamento delle select dinamiche che, in alcune sezioni contabili, potevano restare ferme al solo placeholder “Seleziona...” pur avendo clienti, fornitori o documenti disponibili.

### Correzioni principali

- **Contabilità → Incassi e pagamenti**: la combo **Soggetto** ora viene popolata con clienti o fornitori in base al tipo movimento.
- **Contabilità → Partitario**: il filtro soggetto viene inizializzato anche quando la select contiene già un placeholder statico.
- **Contabilità → Estratto conto**: stesso consolidamento del filtro soggetto.
- **Analisi → Stampe / PDF**: popolamento più robusto di soggetti e documenti.
- **Analisi → UX / accessibilità**: aggiunto controllo consultivo sulle select dinamiche più critiche.

### Vincoli rispettati

- Nessuna nuova collezione Firestore.
- Nessun backend custom.
- Nessuna migrazione dati.
- Nessuna modifica ai dati applicativi.
- Compatibilità con dati legacy e normalizzatori esistenti.

### Verifica consigliata

1. Aprire **Contabilità → Incassi e pagamenti**.
2. Verificare che **Incasso cliente** mostri l’elenco clienti.
3. Cambiare in **Pagamento fornitore** e verificare l’elenco fornitori.
4. Aprire **Partitario**, **Estratto conto** e **Stampe / PDF** e controllare i filtri soggetto/documento.
5. Aprire **Analisi → UX / accessibilità** e verificare il controllo “Select dinamiche popolate”.
