# 57. Identità visiva, nome esteso e favicon 0.8.0

## Obiettivo

La versione **0.8.0** introduce un consolidamento leggero dell’identità visiva del progetto, senza modificare la logica gestionale né il modello dati.

Il progetto usa ora in modo più esplicito il nome:

**CDSDM — Cloud Data Suite for Digital Management**

## Dove compare il nome esteso

Per aiutare utenti, studenti e docenti a riconoscere meglio il progetto, il nome esteso è stato aggiunto nei punti più utili:

- titolo del browser/tab;
- schermata di login;
- intestazione laterale (sidebar);
- barra superiore dell’app;
- home page;
- pagina “Informazioni Versione”.

## Favicon integrata

Sono stati aggiunti gli asset in:

```text
assets/branding/
```

File principali:

- `brand-mark.png`;
- `favicon.ico`;
- `favicon-16.png`;
- `favicon-32.png`;
- `apple-touch-icon.png`;
- `android-chrome-192x192.png`;
- `android-chrome-512x512.png`.

`index.html` include ora i riferimenti standard per mostrare la favicon nel browser e sui dispositivi compatibili.

## Perché è utile

Questa modifica migliora:

- riconoscibilità del progetto in aula;
- coerenza tra acronimo e nome esteso;
- presentazione verso utenti finali;
- chiarezza della documentazione e del materiale didattico.

## Compatibilità

La 0.8.0 non cambia:

- strutture Firestore;
- backup/import/reset;
- ruoli e permessi;
- autenticazione Firebase;
- compatibilità con `users/{uid}` e `businessGroups/{groupId}`.
