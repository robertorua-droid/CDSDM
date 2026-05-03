# 60. Ripristino icona classica e Dark Mode 0.8.3

## Obiettivo

La versione **0.8.3** recepisce un feedback di usabilità/identità visiva: l’icona classica precedente risultava più riconoscibile e preferibile rispetto alla variante introdotta nelle release 0.8.1–0.8.2.

## Cosa cambia

La release:

- ripristina l’icona classica come base del branding applicativo;
- rigenera gli asset in `assets/branding/` a partire da quella icona;
- introduce una variante `brand-mark-darkmode.png` più leggibile su sfondi scuri;
- applica un leggero supporto visivo (ombra/glow) nelle aree dove il logo rischiava di perdersi in Dark Mode.

## Asset aggiornati

```text
assets/branding/brand-mark.png
assets/branding/brand-mark-darkmode.png
assets/branding/favicon.ico
assets/branding/favicon-16.png
assets/branding/favicon-32.png
assets/branding/favicon-48.png
assets/branding/apple-touch-icon.png
assets/branding/android-chrome-192x192.png
assets/branding/android-chrome-512x512.png
```

## Aree toccate

- login;
- sidebar;
- home;
- pagina versione.

## Compatibilità

La 0.8.3 non cambia logica gestionale, dati, Firestore, regole, ruoli, permessi o flussi documentali. È una release di affinamento esclusivamente visivo.
