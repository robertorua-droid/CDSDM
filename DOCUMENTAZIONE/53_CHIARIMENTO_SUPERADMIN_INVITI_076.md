# 0.7.6 — Chiarimento Superadmin, docente e inviti studenti

## Perché nasce questo aggiornamento

In alcune installazioni il docente può essere amministratore del Gruppo aziendale ma non Superadmin globale. I due ruoli sono distinti:

- **Superadmin globale**: configurato nel documento `appSettings/system`, serve per bootstrap e diagnostica applicativa.
- **Amministratore/Docente del gruppo**: configurato in `businessGroups/{groupId}/members/{uid}`, gestisce membri, inviti e permessi del gruppo didattico.

## Dove si creano gli inviti

Gli inviti agli studenti si creano da:

```text
Menu laterale → Gruppi aziendali → Crea invito collaboratore
```

Il sistema non spedisce email automaticamente. Il docente deve copiare il codice invito e comunicarlo allo studente insieme a:

- email invitata;
- ID gruppo;
- codice invito;
- ruolo/profilo assegnato.

## Come entra lo studente

Se lo studente non ha ancora account Firebase:

```text
Login → Registrati con invito
```

Se lo studente ha già un account Firebase:

```text
Login → Accedi → Gruppi aziendali → Accetta invito
```

## Correzione prudente 0.7.6

Il pannello Superadmin ora mostra avvisi diagnostici senza bloccare l'intera schermata quando una lettura Firestore non è consentita. Inoltre mostra un collegamento diretto al pannello Gruppi aziendali, dove si generano gli inviti.
