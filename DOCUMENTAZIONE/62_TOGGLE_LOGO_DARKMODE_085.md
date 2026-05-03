# 62. Toggle Dark Mode e logo Dark Mode 0.8.5

## Obiettivo

La versione **0.8.5** rifinisce due dettagli della sidebar:

1. mantenere il controllo **Dark mode** su una sola riga, senza andare a capo;
2. migliorare la leggibilità del logo sugli sfondi scuri, senza modificarne il disegno di base.

## Interventi applicati

### Toggle Dark Mode
Il blocco della sidebar è stato aggiornato per usare:

- layout `flex` senza wrap;
- etichetta `Dark mode` con `white-space: nowrap`;
- migliore allineamento tra switch, icona luna e testo.

### Logo in Dark Mode
Il logo è stato migliorato solo a livello di resa visiva:

- lieve aumento di contrasto e saturazione;
- glow/ombra morbida per staccarlo meglio dallo sfondo;
- cornice leggera nel contenitore della sidebar in Dark Mode.

## Compatibilità

La 0.8.5 non cambia:

- logica gestionale;
- dati Firestore;
- permessi;
- gruppi aziendali;
- backup/import/reset.

È una release di rifinitura esclusivamente UI/CSS.
