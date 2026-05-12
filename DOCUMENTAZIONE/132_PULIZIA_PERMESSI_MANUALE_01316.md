# 132 — Pulizia area permessi e manuale gestione utenti 0.13.16

## Obiettivo

La versione **0.13.16** consolida l'area permessi dopo le correzioni 0.13.11–0.13.15.

L'obiettivo non è aggiungere nuove funzioni, ma rendere chiaro il modello operativo:

```text
Gruppi aziendali → membri e inviti
Profili permesso → profili assegnabili ai membri
Matrice permessi → significato dei livelli none/read/write/admin
Ruoli e permessi → riepilogo informativo
Override permessi → scheletro legacy nascosto
```

## Override permessi

La funzione **Override permessi** resta nel codice come traccia tecnica storica. Non viene eliminata perché potrebbe essere utile in futuro se si decidesse di reintrodurre una gestione fine per singolo utente.

Tuttavia, nella linea didattica corrente:

- non è visibile nel menu operativo;
- non è il percorso consigliato per modificare i privilegi;
- non deve essere usata per la gestione ordinaria di studenti e collaboratori.

La scelta didattica è usare profili espliciti, nominati e riutilizzabili.

## Manuale utente

Il Manuale Utente è stato ampliato con un capitolo speciale su:

- account Firebase Auth;
- gruppi aziendali;
- membri;
- inviti;
- registrazione con invito;
- differenza tra ruolo, profilo e matrice;
- assegnazione profili ai membri;
- perché gli override individuali sono nascosti;
- checklist docente/amministratore;
- troubleshooting dei problemi più comuni.

## Compatibilità

La 0.13.16 non modifica:

- Firestore collections;
- `firestore.rules`;
- modello inviti;
- workflow documentale;
- backup/import/reset, salvo aggiornamento del riferimento versione;
- backend custom o Cloud Functions.
