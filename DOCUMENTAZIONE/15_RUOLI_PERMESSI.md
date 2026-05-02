## Aggiornamento 0.6.5 - Sicurezza Firestore su permessi effettivi

La UI continua a usare `PermissionsPolicy`, ma la 0.6.5 allinea anche `firestore.rules` ai permessi effettivi. I livelli `none/read/write/admin` influenzano lettura, creazione/modifica ed eliminazione dei dati condivisi quando `effectiveProfilePermissions` è presente sul membro.

## Aggiornamento 0.6.4 - Override permessi per singolo utente

Oltre a ruolo, profilo e matrice, la sezione **Impostazioni → Override permessi** consente di applicare eccezioni a un singolo membro. Gli override sono utili per simulazioni didattiche in cui uno studente deve avere accessi leggermente diversi dal profilo standard.

## Aggiornamento 0.6.3 - Matrice permessi moduli

Oltre ai profili 0.6.2, la nuova sezione **Impostazioni → Matrice permessi** documenta e configura cosa comportano `none`, `read`, `write` e `admin` per ogni modulo e voce di menu.

## Aggiornamento 0.6.2 - Profili permesso configurabili

Oltre ai ruoli base, ogni membro può ricevere un profilo permesso con matrice moduli. I livelli disponibili sono nessuno, lettura, scrittura e admin.

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
