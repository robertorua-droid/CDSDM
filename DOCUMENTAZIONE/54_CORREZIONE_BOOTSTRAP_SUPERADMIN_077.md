# 54. Correzione bootstrap Superadmin 0.7.7

## Problema rilevato

In alcuni progetti Firebase il pannello **Superadmin** mostrava:

```text
Missing or insufficient permissions
```

anche quando il documento globale `appSettings/system` non risultava ancora configurato. Il problema dipendeva dal fatto che la SPA provava prima a leggere `appSettings/system`; se le regole Firestore pubblicate nel progetto non consentivano quella lettura, il bootstrap veniva interrotto prima di tentare la creazione.

## Correzione 0.7.7

Il bootstrap ora è più prudente:

1. prova a leggere `appSettings/system`;
2. se la lettura è negata per permessi, non si blocca;
3. tenta comunque la scrittura iniziale create-only del documento;
4. se anche la scrittura è negata, mostra un messaggio operativo chiaro.

## Cosa deve essere vero su Firebase

Per usare il bootstrap da front-end devono essere pubblicate le regole `firestore.rules` incluse nel pacchetto. In particolare deve essere consentita la creazione iniziale di:

```text
appSettings/system
```

quando:

```text
superadminUid == UID dell’utente autenticato
superadminEmail == email dell’utente autenticato
superadminEmails contiene l’email dell’utente autenticato
status == active
```

Se le regole pubblicate non sono aggiornate, la SPA non può auto-elevarsi: Firestore blocca correttamente l’operazione. In quel caso ci sono due strade:

1. pubblicare `firestore.rules` del pacchetto;
2. creare manualmente `appSettings/system` in Firebase Console.

## Creazione manuale alternativa

In Firebase Console → Firestore Database creare:

```text
collection: appSettings
document: system
```

Campi minimi:

```json
{
  "appName": "CDSDM - Cloud Data Suite for Digital Management",
  "version": "0.7.7",
  "schemaVersion": "superadmin-0.7.7",
  "status": "active",
  "superadminUid": "UID_FIREBASE_UTENTE",
  "superadminEmail": "email@utente.it",
  "superadminEmails": ["email@utente.it"]
}
```

Dopo la modifica è necessario uscire e rientrare nell’app.

## Inviti studenti

Gli inviti agli studenti non si creano dal pannello Superadmin. Il percorso corretto è:

```text
Menu laterale → Gruppi aziendali → Crea invito collaboratore
```

Il pannello Superadmin serve solo per bootstrap e diagnostica globale.
