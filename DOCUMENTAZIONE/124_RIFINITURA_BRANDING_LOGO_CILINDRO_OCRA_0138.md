# 124 — Rifinitura branding logo cilindro ocra 0.13.8

## Obiettivo

La versione **0.13.8** affina il logo introdotto nella 0.13.7. Il feedback raccolto indicava che il cilindro/database risultava poco leggibile rispetto al resto del pittogramma.

## Intervento applicato

La release mantiene il logo a sfondo trasparente, ma modifica il colore del cilindro/database con una tonalità **ocra/oro** progettata per risultare più visibile sia su sfondo bianco sia su sfondo nero/scuro.

## Asset aggiornati

```text
assets/branding/brand-mark.png
assets/branding/brand-mark-darkmode.png
assets/branding/brand-mark-source-0138.png
assets/branding/favicon.ico
assets/branding/favicon-16.png
assets/branding/favicon-32.png
assets/branding/favicon-48.png
assets/branding/apple-touch-icon.png
assets/branding/android-chrome-192x192.png
assets/branding/android-chrome-512x512.png
```

## Compatibilità

La 0.13.8 non modifica:

- logica gestionale;
- Firestore;
- backup/import/reset (salvo aggiornamento del riferimento versione);
- ruoli e permessi;
- compatibilità con `users/{uid}` e `businessGroups/{groupId}`;
- necessità di backend custom o Cloud Functions.
