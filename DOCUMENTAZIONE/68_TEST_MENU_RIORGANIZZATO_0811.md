# 68. Test finale riorganizzazione menu 0.8.11

## Obiettivo

La versione **0.8.11** aggiunge il test browser-based finale della riorganizzazione menu.

## Cosa verifica

Il test controlla che:

- le nuove sezioni **Impostazioni**, **Organizzazione**, **Didattica** e **Amministrazione** siano presenti;
- i `data-target` principali non siano stati persi;
- ogni `data-target` punti ancora a una `content-section` esistente quando previsto;
- l’aiuto contestuale sia coerente con i nuovi percorsi.
