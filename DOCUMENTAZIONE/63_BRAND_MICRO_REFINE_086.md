# 63. Micro rifinitura brand e Dark Mode pulita 0.8.6

## Obiettivo

La versione **0.8.6** recepisce un feedback mirato sul branding: in Dark Mode il bordo/piastra chiara attorno al logo poteva risultare visivamente poco gradevole.

L’intervento non cambia il logo nella sostanza, ma ne migliora la presentazione.

## Interventi applicati

- rimosso lo swap verso la variante `brand-mark-darkmode.png` nelle principali aree UI;
- mantenuto il logo standard come riferimento unico;
- resa Dark Mode affidata a CSS più leggeri:
  - lieve aumento di contrasto e saturazione;
  - glow blu molto morbido;
  - sfondo del contenitore più discreto e meno evidente;
  - eliminazione della piastra chiara marcata.

## Aree toccate

- schermata login;
- sidebar;
- home;
- pagina Informazioni Versione.

## Compatibilità

La 0.8.6 è una release solo UI/CSS e non modifica:

- dati Firestore;
- logica gestionale;
- permessi;
- backup/import/reset;
- flussi documentali.
