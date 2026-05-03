# 108. Manuale in-app evoluto, aiuto contestuale e guide operative 0.12.14

## Obiettivo

La versione **0.12.14** aggiorna il manuale in-app e gli aiuti rapidi contestuali, rendendoli più utili per l’uso operativo e didattico del progetto.

## Cosa cambia

- Il box **Aiuto rapido** non mostra più riferimenti obsoleti alla 0.7.3.
- Ogni sezione principale può mostrare:
  - descrizione del flusso;
  - passi consigliati;
  - esempio pratico;
  - nota didattica o operativa.
- Il pulsante **?** resta contestuale e porta alla guida della pagina corrente.
- Il manuale utente contiene ora flussi operativi aggiornati per:
  - Vendite: preventivo → workflow → ordine → DDT → fattura;
  - Acquisti: ordine fornitore → workflow → DDT fornitore → ricezione merce;
  - Workflow approvativo: bozza → documento operativo;
  - Segnalazioni operative: bozza → invio → presa in carico → chiusura;
  - Mini B.I.: KPI, drill-down, alert ed export.

## Esempio operativo — merce ricevuta e quarantena

1. Crea un **Ordine fornitore**.
2. Se è in bozza, approva il documento da **Analisi → Workflow approvativi**.
3. Vai in **Acquisti → DDT fornitore**.
4. Seleziona fornitore e ordine confermato.
5. Registra quantità ricevute e quantità in quarantena.
6. Crea una **Segnalazione operativa** verso Acquisti o Direzione.
7. Invia la segnalazione e registra le comunicazioni interne.
8. Chiudi la segnalazione dopo verifica/risoluzione.

## Esempio operativo — preventivo approvato in ordine cliente

1. Crea un **Preventivo cliente**.
2. Fallo approvare dal **Workflow approvativo**.
3. Riapri il preventivo.
4. Usa **Crea ordine cliente**.
5. L’ordine potrà alimentare DDT cliente e fatturazione.

## Nota didattica

Il manuale non sostituisce la documentazione tecnica di release, ma aiuta studenti, docenti e utenti a seguire il flusso aziendale corretto.

## File coinvolti

- `js/ui/onboarding-help-service.js`
- `css/style.css`
- `DOCUMENTAZIONE/02_MANUALE_UTENTE.md`
- `DOCUMENTAZIONE/55_GUIDA_MENU_COMPLETA_078.md`
- `js/features/navigation/docs-content.js`
- `tests/manuale-aiuto-01214.test.html`

## Compatibilità

La release non introduce nuove collezioni Firestore, non modifica regole Firestore, non richiede backend custom e non richiede Cloud Functions.
