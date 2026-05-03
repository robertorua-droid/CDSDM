# 56. Correzione aiuto contestuale 0.7.9

La versione 0.7.9 corregge il comportamento del pulsante contestuale **?** nella barra superiore.

## Problema rilevato

Nella 0.7.8 il pulsante era visibile e il tooltip funzionava, ma il click poteva non produrre effetto.

La causa era tecnica: il bottone veniva creato dinamicamente nella top bar, mentre il binding diretto dell'evento click poteva essere eseguito quando il bottone non era ancora presente nel DOM.

## Comportamento atteso

Quando l'utente clicca **?**:

1. l'app passa alla sezione **Manuale Utente**;
2. il titolo della pagina diventa **Guida menu**;
3. viene caricata `DOCUMENTAZIONE/55_GUIDA_MENU_COMPLETA_078.md`;
4. l'app scorre automaticamente al capitolo collegato alla pagina visualizzata.

Esempi:

- da **Superadmin** apre il capitolo Superadmin;
- da **Gruppi aziendali** apre il capitolo Gruppi aziendali;
- da **DDT cliente** apre il capitolo DDT cliente;
- da **Giacenze** apre il capitolo Giacenze.

## Nota UX

La guida non si apre in una finestra separata: viene visualizzata nella sezione interna **Info → Manuale Utente**, così resta consultabile anche da browser senza popup e senza backend.
