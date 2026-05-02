# Dark Mode form e combo — versione 0.4.7

La release 0.4.7 migliora il contrasto dei controlli form in Dark Mode, con focus particolare sulle combo/select mostrate nelle sezioni contabili, magazzino, stampe e bilancino.

## Obiettivo

Alcuni menu a tendina nativi risultavano leggibili quando chiusi, ma mostravano sfondo chiaro e testo a basso contrasto durante l'apertura del menu, soprattutto in presenza di opzioni disabilitate. La release introduce regole CSS dedicate per ridurre questo problema.

## Interventi

- Sfondo e testo coerenti per `select` e `.form-select` in Dark Mode.
- Stili per `option`, `option:checked`, `option:disabled` e `optgroup`.
- Focus ring più visibile su combo e campi data.
- Supporto `color-scheme: dark` sui controlli form.
- Migliore leggibilità per campi `date`, `month`, `time` e `datetime-local`.
- Aggiornamento del report **Analisi → UX / accessibilità** con un controllo consultivo dedicato.

## Limiti

Le `<select>` native sono renderizzate in parte dal browser e dal sistema operativo. Alcuni dettagli del menu aperto possono quindi variare tra Chrome, Edge, Firefox, Safari e sistemi operativi diversi. La release migliora il contrasto generale senza sostituire i controlli nativi con componenti custom.

## File principali

```text
css/style.css
js/ui/accessibility-ux-service.js
js/ui/accessibility-ux-module.js
tests/dark-mode-047-form-controls.test.html
```

## Verifica attesa

In Dark Mode le combo devono risultare leggibili sia chiuse sia aperte, con opzioni disabilitate distinguibili ma non invisibili. La sezione UX/accessibilità deve mostrare il controllo **Contrasto combo/select in Dark Mode**.
