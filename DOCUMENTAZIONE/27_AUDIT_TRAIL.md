# 27. Registro attività / audit trail — CDSDM 0.4.3

La release 0.4.3 introduce la sezione **Analisi → Registro attività**, pensata come punto unico di consultazione delle attività operative più rilevanti.

## Funzioni principali

- elenco eventi filtrabile per categoria, fonte, priorità, periodo e testo;
- riepiloghi rapidi su eventi totali, workflow, pagamenti, riconciliazioni, eventi manuali e warning;
- registrazione manuale di eventi applicativi;
- export CSV;
- integrazione con ruoli e permessi;
- backup/import/reset aggiornati per la collezione `auditEvents`.

## Fonti dati

La vista combina:

- `auditEvents`: eventi manuali salvati dall'utente;
- `workflowEvents`: approvazioni, revisioni, blocchi e respingimenti;
- `paymentEvents`: incassi e pagamenti evoluti;
- `cashbookMovements`: movimenti manuali di prima nota;
- `reminderEvents`: solleciti registrati;
- `bankReconciliationEvents`: riconciliazioni confermate;
- `businessBudgets`: aggiornamenti budget.

## Moduli introdotti

```text
js/features/accounting/audit-trail-service.js
js/features/accounting/audit-trail-module.js
```

## Normalizzatore

È disponibile `DomainNormalizers.normalizeAuditEvent`, utile per mantenere compatibilità con eventi manuali legacy o importati.

## Limite importante

Il registro attività è un controllo didattico/applicativo lato client. Non impedisce modifiche dirette a Firestore da strumenti esterni e non garantisce immutabilità forense. Per scenari reali servono regole Firestore, logging server-side e processi di controllo esterni.
