# Accessibilità form e pulsanti — versione 0.4.6

La release 0.4.6 consolida la sezione **Analisi → UX / accessibilità** riducendo le segnalazioni sui campi form senza label/aria e sui pulsanti senza nome accessibile.

## Obiettivo

Il controllo 0.4.4 evidenziava molti elementi legacy o dinamici non etichettati. La 0.4.6 introduce una correzione runtime non distruttiva:

- i campi `input`, `select` e `textarea` privi di label ricevono un `aria-label` derivato da `id`, `name`, `placeholder` o tipo campo;
- i pulsanti senza testo, `aria-label` o `title` ricevono un nome accessibile derivato da icona, id, target o azione;
- gli elementi corretti runtime sono marcati con `data-a11y-auto-label="true"` per rendere l'intervento ispezionabile;
- la vista UX mostra quante auto-correzioni sono state applicate.

## Limiti

La correzione è client-side e serve a migliorare usabilità e didattica del progetto. Non sostituisce un audit WCAG completo e non modifica dati applicativi o documenti Firestore.

## File principali

```text
js/ui/accessibility-ux-service.js
js/ui/accessibility-ux-module.js
tests/ux-accessibility-046.test.html
```

## Verifica attesa

Aprendo **Analisi → UX / accessibilità**, i controlli principali su:

- campi form etichettati;
- pulsanti con nome accessibile;

non dovrebbero più mostrare centinaia di segnalazioni, salvo nuovi elementi dinamici creati da future release senza convenzioni coerenti.
