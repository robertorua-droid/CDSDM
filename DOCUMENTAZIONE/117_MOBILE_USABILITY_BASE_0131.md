# Mobile usability base 0.13.1

La versione **0.13.1** applica il primo intervento prudente dopo il Mobile readiness audit 0.13.0.

Lo scopo è migliorare le aree già classificate ad alta compatibilità mobile, senza trasformare CDSDM in una nuova app mobile e senza introdurre nuovi flussi applicativi.

## Ambito

Interventi inclusi:

- Manuale Utente più leggibile su smartphone;
- aiuti rapidi **?** più comodi su schermi piccoli;
- card, pulsanti e modali con spaziature minime più adatte al touch;
- tabelle mantenute con scorrimento orizzontale controllato, non ancora trasformate in card operative;
- immagini e blocchi codice del manuale contenuti entro la larghezza dello schermo;
- test browser-based statico per verificare le regole CSS e i riferimenti di versione.

## Cosa non cambia

La 0.13.1 non introduce:

- nuove collezioni Firestore;
- nuove regole Firestore;
- nuove voci di menu;
- nuovi workflow;
- nuove schermate operative;
- backend custom;
- Cloud Functions obbligatorie;
- redesign completo della navigazione.

## Compatibilità attesa

Aree migliorate:

- **Manuale Utente**: lettura, indice, checklist ed esercitazioni più fruibili su 360–430 px;
- **Aiuti rapidi**: pulsante e pannello contestuale più utilizzabili con touch;
- **Dashboard e consultazione base**: card e pulsanti con spaziature più sicure;
- **Pagine informative**: minor rischio di overflow orizzontale accidentale.

Aree non ancora ottimizzate:

- documenti con molte righe;
- tabelle operative complesse;
- Mini B.I. avanzata con drill-down;
- console docente avanzata;
- audit sicurezza;
- permessi e configurazioni.

## Criteri di QA

Il test 0.13.1 controlla che:

- la versione in-app sia 0.13.1;
- il backup JSON riporti `appVersion: 0.13.1`;
- il CSS contenga media query per smartphone;
- manuale e aiuti rapidi abbiano regole mobile dedicate;
- i pulsanti abbiano altezza minima utile al touch;
- il documento 117 sia sincronizzato in `docs-content.js`.

## Raccomandazione per la versione successiva

La successiva evoluzione naturale è **0.13.2 — Liste e tabelle responsive**, dove si potrà iniziare a trasformare alcune tabelle consultative in card mobile, mantenendo la tabella classica su desktop.
