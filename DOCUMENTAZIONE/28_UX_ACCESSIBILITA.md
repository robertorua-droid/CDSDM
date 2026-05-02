# UX / Accessibilità — versione 0.4.4

La versione 0.4.4 introduce un consolidamento UX/accessibilità della SPA.

## Obiettivo

La release non aggiunge nuovi processi gestionali e non modifica i dati. Serve a migliorare l'usabilità dell'interfaccia e a introdurre controlli consultivi di qualità HTML/accessibilità.

## Funzioni introdotte

- skip link verso il contenuto principale;
- landmark ARIA per contenuto principale e navigazione;
- focus visibile su link, pulsanti, campi form e header della sidebar;
- supporto tastiera Enter/Spazio sulle intestazioni delle sezioni menu;
- aggiornamento di `aria-expanded` sulle sezioni della sidebar;
- vista **Analisi → UX / accessibilità**;
- controlli su label dei form, pulsanti senza nome, collegamenti menu/sezioni e ID duplicati;
- export CSV dei controlli.

## Moduli

```text
js/ui/accessibility-ux-service.js
js/ui/accessibility-ux-module.js
```

## Limiti

I controlli sono client-side e consultivi. Non sostituiscono un audit WCAG completo, test con screen reader reali o verifiche specialistiche di accessibilità.

## Compatibilità

La release non introduce nuove collezioni Firestore, non richiede migrazioni e non modifica i dati applicativi.
