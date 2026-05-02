# Inviti avanzati e onboarding collaboratori 0.6.1

La versione **0.6.1** rafforza il flusso di invito introdotto nella 0.6.0, mantenendo il vincolo architetturale del progetto: solo front-end, Firebase Auth e Firestore.

## Obiettivo

Rendere più chiara e governabile la fase in cui admin, docente o revisore collega nuovi collaboratori/studenti a un Gruppo aziendale.

## Stati invito

Gli inviti sotto:

```text
businessGroups/{groupId}/invites/{inviteCode}
```

possono assumere questi stati:

```text
pending   - invito in attesa e utilizzabile
accepted  - invito accettato da un account Firebase con email coerente
revoked   - invito revocato o sostituito
expired   - invito scaduto e consolidato come non utilizzabile
```

La UI calcola anche uno stato effettivo: un invito `pending` con scadenza passata viene mostrato come `expired` anche prima della marcatura esplicita.

## Creazione invito

Dal pannello **Impostazioni → Gruppi aziendali**, un admin/teacher può creare un invito inserendo:

- email invitata;
- ruolo;
- validità: 7, 14, 30 o 60 giorni;
- note onboarding.

Il gestionale non invia email automaticamente. Genera un testo copiabile con:

```text
ID gruppo
codice invito
email invitata
ruolo
scadenza
istruzioni di primo accesso
```

## Revoca e rigenerazione

Un invito non ancora accettato può essere:

- revocato;
- rigenerato con un nuovo codice.

La rigenerazione crea un nuovo documento invito e marca il codice precedente come revocato/sostituito, mantenendo tracciabilità via audit applicativo.

## Registrazione con invito

La schermata login contiene **Registrati con invito**. Il collaboratore inserisce:

- email invitata;
- password desiderata;
- ID Gruppo aziendale;
- codice invito.

Il browser crea l’account con Firebase Auth e poi tenta l’accettazione invito. Se l’accettazione fallisce perché il codice è errato, scaduto o associato a un’altra email, la 0.6.1 prova a rimuovere l’account appena creato per evitare account di test inutili.

## Limite tecnico dichiarato

Prima del login l’app non può leggere liberamente gli inviti protetti dalle regole Firestore. Per questo la verifica completa avviene dopo la creazione dell’account Firebase Auth. La sicurezza dei dati resta basata su membership e regole Firestore: un account senza membership non accede ai dati aziendali.

## Regole Firestore

La 0.6.1 mantiene la protezione per:

- `businessGroups/{groupId}/members/{uid}`;
- `users/{uid}/memberships/{groupId}`;
- `businessGroups/{groupId}/invites/{inviteCode}`.

Gli inviti creati dalla 0.6.1 salvano la scadenza anche come timestamp; le rules verificano che l’invito pendente non sia scaduto quando l’invitato crea membership/member.

## Prossimi passi

La roadmap successiva prevede profili permesso configurabili per gruppo e matrice di accesso ai moduli.
