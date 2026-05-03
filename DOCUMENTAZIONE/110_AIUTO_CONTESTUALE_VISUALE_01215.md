# 110. Aiuto contestuale non invasivo e Manuale utente visuale 0.12.15

## Obiettivo

La versione **0.12.15** migliora l’esperienza utente della documentazione in-app.

## Novità

- Gli aiuti rapidi non sono più box fissi sempre visibili nelle pagine operative.
- Ogni pagina principale può mostrare una piccola icona **?** accanto al titolo.
- Il click sull’icona apre un pannello contestuale richiudibile.
- Il manuale generale è disponibile da **Info → Manuale Utente**.
- Il manuale è stato trasformato in guida visuale con card, step, esempi e box di attenzione.

## Scelte UX

La separazione è intenzionale:

- **? vicino al titolo**: aiuto rapido della pagina corrente.
- **Info → Manuale Utente**: guida generale completa.

## Compatibilità

La release non introduce nuove collezioni Firestore, non modifica `firestore.rules`, non richiede backend custom e non richiede Cloud Functions.
