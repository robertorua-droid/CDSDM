# 15. Ruoli e permessi 0.2.6

La versione 0.2.6 introduce controlli applicativi front-end per ruoli e permessi.

## Dove si trova

```text
Impostazioni → Ruoli e permessi
```

## Profili disponibili

- **Admin**: accesso completo.
- **Commerciale**: vendite, clienti, documenti cliente, scadenzario e KPI.
- **Magazzino**: prodotti, ordini/DDT di magazzino, giacenze, lotti, movimenti e report operativi.
- **Contabilità**: fatture, acquisti, scadenzario, registri IVA, fiscalità e tabelle contabili.
- **Sola lettura**: consultazione estesa senza creazione, modifica, import o reset dati.

## Persistenza

Le impostazioni sono salvate nel documento esistente:

```text
users/{uid}/settings/companyInfo.accessControl
```

Non vengono introdotte nuove collezioni Firestore e non sono richieste migrazioni obbligatorie.

## Limiti di sicurezza

I permessi 0.2.6 sono controlli lato client pensati per didattica e UX. Non rappresentano sicurezza multiutente forte.

Per una sicurezza reale servono:

- un modello organizzazione/utenti;
- ruoli salvati server-side o in claim attendibili;
- regole Firestore coerenti;
- eventuali funzioni serverless o flussi amministrativi controllati.

## Compatibilità

Se `accessControl.enabled` è assente o falso, l'app si comporta come prima e considera il ruolo Admin.
