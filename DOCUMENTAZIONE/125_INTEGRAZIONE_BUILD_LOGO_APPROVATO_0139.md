# 125 — Integrazione build del logo approvato 0.13.9

## Obiettivo

La versione **0.13.9** integra nella build il logo approvato in preview dopo la fase di rifinitura del branding 0.13.7–0.13.8.

## Intervento applicato

La preview selezionata è stata:

- adottata come base del nuovo `brand-mark.png`;
- convertita in PNG con **sfondo trasparente**;
- adattata al set icone/favicons del progetto;
- archiviata anche come riferimento sorgente nella cartella branding.

Il cilindro/database del logo presenta **sezioni differenziate**, per una resa più naturale rispetto alle versioni precedenti in cui gli elementi apparivano troppo simili tra loro.

## Asset aggiornati

```text
assets/branding/brand-mark.png
assets/branding/brand-mark-darkmode.png
assets/branding/brand-mark-source-0139-approved-preview.png
assets/branding/brand-mark-source-0139-preview-original.png
assets/branding/favicon.ico
assets/branding/favicon-16.png
assets/branding/favicon-32.png
assets/branding/favicon-48.png
assets/branding/apple-touch-icon.png
assets/branding/android-chrome-192x192.png
assets/branding/android-chrome-512x512.png
```

## Compatibilità

La 0.13.9 non modifica:

- logica gestionale;
- Firestore;
- backup/import/reset (salvo aggiornamento del riferimento versione);
- ruoli e permessi;
- compatibilità con `users/{uid}` e `businessGroups/{groupId}`;
- necessità di backend custom o Cloud Functions.
