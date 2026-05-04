# 113. Aiuto rapido collegato al manuale 0.12.17

La versione **0.12.17** consolida l’esperienza introdotta con il manuale a capitoli 0.12.16. Gli aiuti rapidi contestuali, aperti con l’icona **?** accanto al titolo pagina, ora espongono un collegamento al capitolo del manuale più coerente con il flusso visualizzato.

## Obiettivo

Ridurre la distanza tra promemoria operativo e spiegazione completa:

- il pannello **?** resta breve e non invasivo;
- il manuale resta la fonte completa;
- il collegamento porta al capitolo pertinente, per esempio Vendite, Acquisti, Workflow, Segnalazioni operative, Mini B.I., Magazzino, Contabilità, Backup o Permessi.

## Moduli aggiornati

- `js/ui/onboarding-help-service.js`: aggiunti `manualAnchor`, helper `manualAnchorFor()` e apertura del manuale sul capitolo collegato.
- `js/features/navigation/navigation-module.js`: dopo il caricamento del manuale gestisce `window.CDSDM_MANUAL_TARGET_ANCHOR` e scorre all’anchor richiesto.
- `css/style.css`: stile dedicato ai link manuale e agli anchor invisibili.
- `DOCUMENTAZIONE/111_MANUALE_CAPITOLI_01216.md`: mantenuto come documento caricato dall’app, ma aggiornato nei contenuti alla 0.12.17 con anchor stabili.

## Compatibilità

Non sono state introdotte nuove collezioni Firestore, nuovi backend o Cloud Functions obbligatorie. La modifica è solo UI/documentale e resta compatibile con `users/{uid}` e `businessGroups/{groupId}`.

## Test

Aggiunto `tests/aiuto-manuale-contestuale-01217.test.html`, che verifica:

- versione del servizio 0.12.17;
- presenza degli anchor manuale nei dati di aiuto;
- rendering del link al capitolo;
- presenza degli anchor nel manuale sincronizzato in `docs-content.js`.
