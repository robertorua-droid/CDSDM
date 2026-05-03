# 58. Rifinitura branding e uniformazione naming 0.8.1

## Obiettivo

La versione **0.8.1** rifinisce il lavoro di identità visiva avviato nella 0.8.0.

L’obiettivo è duplice:

1. uniformare i punti applicativi in cui era ancora presente il vecchio nome **Gestionale Cloud - Professionisti**;
2. migliorare la qualità del logo/favicon per uso reale nel browser e nel contesto didattico.

## Uniformazione testi

I riferimenti residui sono stati aggiornati nei punti più significativi:

- fallback `appName` del bootstrap superadmin;
- fallback del servizio di stampa;
- titolo e indice documentazione;
- schermata versione e messaggi di stato applicativi.

La regola seguita è stata questa:

- usare **CDSDM** come nome breve;
- usare **Cloud Data Suite for Digital Management** come nome esteso descrittivo;
- evitare il vecchio nome storico dove non più utile per l’utente finale.

## Raffinamento favicon / logo

Il set `assets/branding/` è stato aggiornato con un’icona più pulita e leggibile, pensata meglio per:

- favicon browser 16x16 e 32x32;
- icona app/web clip;
- visualizzazione in login, sidebar, top bar e home.

Asset coinvolti:

```text
assets/branding/brand-mark.png
assets/branding/favicon.ico
assets/branding/favicon-16.png
assets/branding/favicon-32.png
assets/branding/favicon-48.png
assets/branding/apple-touch-icon.png
assets/branding/android-chrome-192x192.png
assets/branding/android-chrome-512x512.png
```

## Compatibilità

La 0.8.1 non introduce cambiamenti a:

- modello dati Firestore;
- regole di persistenza;
- backup/import/reset;
- ruoli, permessi, gruppi aziendali;
- flussi gestionali.

È quindi una release di rifinitura grafica e terminologica, compatibile con i dati esistenti.
