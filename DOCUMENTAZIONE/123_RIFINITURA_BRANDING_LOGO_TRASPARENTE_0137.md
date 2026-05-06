# 123 — Rifinitura branding logo trasparente 0.13.7

## Obiettivo

La versione **0.13.7** rifinisce il branding dell’applicazione migliorando il logo principale. Il feedback raccolto evidenziava che, soprattutto nella pagina di login, il logo risultava visivamente poco gradevole a causa di un contorno bianco percepito.

## Intervento applicato

La release rigenera il set branding principale con un logo più pulito:

- **trasparenza reale** dello sfondo;
- eliminazione del contorno bianco marcato percepito sul bordo del logo;
- riuso dello stesso logo sia su sfondi chiari sia su sfondi scuri;
- rigenerazione coerente del set favicon/icona.

## Asset aggiornati

```text
assets/branding/brand-mark.png
assets/branding/brand-mark-darkmode.png
assets/branding/brand-mark-source-0137.png
assets/branding/favicon.ico
assets/branding/favicon-16.png
assets/branding/favicon-32.png
assets/branding/favicon-48.png
assets/branding/apple-touch-icon.png
assets/branding/android-chrome-192x192.png
assets/branding/android-chrome-512x512.png
```

## Aree interessate

- pagina login;
- sidebar;
- home;
- pagina Informazioni Versione;
- favicon/tab del browser;
- icone web clip/app.

## Compatibilità

La 0.13.7 non modifica:

- logica gestionale;
- Firestore;
- backup/import/reset (salvo aggiornamento del riferimento versione);
- ruoli e permessi;
- compatibilità con `users/{uid}` e `businessGroups/{groupId}`;
- necessità di backend custom o Cloud Functions.
