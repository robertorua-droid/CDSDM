# Documentazione – CDSDM (didattico)

Documentazione aggiornata alla versione **0.11.6**.

> Nota: il progetto è didattico. Le simulazioni fiscali e i calcoli gestionali sono semplificazioni e non sostituiscono consulenza professionale, contabile o fiscale.

## Indice

1) [Panoramica del progetto](./01_PANORAMICA_PROGETTO.md)
2) [Manuale utente](./02_MANUALE_UTENTE.md)
3) [Guida passo-passo](./03_GUIDA_PASSO_PASSO.md)
4) [Gestione Dati - Backup / Import / Reset](./04_GESTIONE_DATI.md)
5) [Uso dati - stima quota Spark](./05_USO_DATI_STIMA.md)
6) [Import XML fattura fornitore](./06_IMPORT_XML_ACQUISTI.md)
7) [Export Timesheet CSV](./07_EXPORT_TIMESHEET_CSV.md)
8) [Workflow tecnico](./08_WORKFLOW_TECNICO.md)
9) [FAQ e troubleshooting](./09_FAQ_TROUBLESHOOTING.md)
10) [Dashboard](./10_DASHBOARD.md)
11) [Changelog](./11_CHANGELOG.md)
12) [Valorizzazione magazzino 0.2.3](./12_VALORIZZAZIONE_MAGAZZINO.md)
13) [Lotti / matricole / scadenze 0.2.4](./13_LOTTI_MATRICOLE_SCADENZE.md)
14) [Import massivi CSV 0.2.5](./14_IMPORT_MASSIVI_CSV.md)
15) [Ruoli e permessi 0.2.6](./15_RUOLI_PERMESSI.md)
16) [Partitario clienti e fornitori 0.3.0](./16_PARTITARIO.md)
17) [Incassi e pagamenti evoluti 0.3.1](./17_INCASSI_PAGAMENTI.md)
18) [Prima nota / movimenti finanziari 0.3.2](./18_PRIMA_NOTA.md)
19) [Estratto conto cliente/fornitore 0.3.3](./19_ESTRATTO_CONTO.md)
20) [Solleciti e promemoria 0.3.4](./20_SOLLECITI_PROMEMORIA.md)
21) [Riconciliazione pagamenti 0.3.5](./21_RICONCILIAZIONE_PAGAMENTI.md)
22) [Budget e marginalità 0.3.6](./22_BUDGET_MARGINALITA.md)
23) [Consolidamento QA e coerenza contabile 0.3.7](./23_CONSOLIDAMENTO_QA.md)
24) [Stampe e PDF HTML 0.4.0](./24_STAMPE_PDF_HTML.md)
25) [Centro notifiche operativo 0.4.1](./25_CENTRO_NOTIFICHE.md)
26) [Workflow approvativi 0.4.2](./26_WORKFLOW_APPROVATIVI.md)
27) [Registro attività / audit trail 0.4.3](./27_AUDIT_TRAIL.md)
28) [UX / Accessibilità 0.4.4](./28_UX_ACCESSIBILITA.md)
29) [Bilancino gestionale 0.4.5](./29_BILANCINO_GESTIONALE.md)
30) [Accessibilità form e pulsanti 0.4.6](./30_ACCESSIBILITA_FORM_PULSANTI.md)
31) [Dark Mode form e combo 0.4.7](./31_DARK_MODE_FORM_CONTROLS.md)
32) [Select dinamiche soggetti 0.4.8](./32_SELECT_DINAMICHE_SOGGETTI.md)
33) [Gruppi aziendali condivisi 0.5.0](./33_GRUPPI_AZIENDALI.md)
34) [Membri, inviti e ruoli 0.5.1](./34_MEMBRI_INVITI_RUOLI.md)
35) [Permessi UI e visibilità menu 0.5.2](./35_PERMESSI_UI_RUOLI.md)
36) [Regole Firestore gruppi e ruoli 0.5.3](./36_REGOLE_FIRESTORE_GRUPPI_RUOLI.md)
37) [Concorrenza e scritture sicure 0.5.4](./37_CONCORRENZA_SCRITTURE_SICURE.md)
38) [Console docente e simulazioni 0.5.5](./38_CONSOLE_DOCENTE_SIMULAZIONI.md)
39) [Migrazione guidata e QA multiutente 0.5.6](./39_MIGRAZIONE_QA_MULTIUTENTE.md)
40) [Superadmin e registrazione con invito 0.6.0](./40_SUPERADMIN_REGISTRAZIONE_INVITO.md)
41) [Inviti avanzati e onboarding 0.6.1](./41_INVITI_AVANZATI_ONBOARDING.md)
42) [Profili permesso configurabili 0.6.2](./42_PROFILI_PERMESSO.md)
43) [Matrice permessi moduli 0.6.3](./43_MATRICE_PERMESSI.md)
44) [Override permessi per singolo utente 0.6.4](./44_OVERRIDE_PERMESSI.md)
45) [Regole Firestore rafforzate 0.6.5](./45_REGOLE_FIRESTORE_RAFFORZATE.md)
46) [Audit sicurezza, report utenti e QA accessi 0.6.6](./46_AUDIT_SICUREZZA_QA_ACCESSI.md)
47) [Consolidamento tecnico generale 0.7.0](./47_CONSOLIDAMENTO_TECNICO_070.md)
48) [QA funzionale end-to-end 0.7.1](./48_QA_END_TO_END_071.md)
49) [Manuale d’uso completo e guida didattica 0.7.2](./49_MANUALE_GUIDA_DIDATTICA_072.md)
50) [UX, testi di aiuto e onboarding in-app 0.7.3](./50_UX_ONBOARDING_073.md)
51) [Dataset demo e scenari didattici 0.7.4](./51_DATASET_DEMO_074.md)
52) [Pacchetto stabile per uso in classe 0.7.5](./52_PACCHETTO_STABILE_CLASSE_075.md)

- [64. Riorganizzazione menu amministrativo 0.8.7](64_RIORGANIZZAZIONE_MENU_087.md)

- [65. Guida menu aggiornata 0.8.8](65_GUIDA_MENU_088.md)

- [66. Aiuto contestuale riallineato 0.8.9](66_AIUTO_CONTESTUALE_089.md)

- [67. Documentazione riorganizzazione menu 0.8.10](67_DOCUMENTAZIONE_MENU_0810.md)

- [68. Test finale riorganizzazione menu 0.8.11](68_TEST_MENU_RIORGANIZZATO_0811.md)

- [69. Consolidamento dati, store e report 0.8.12](69_CONSOLIDAMENTO_DATI_0812.md)

- [70. Fondazione mini B.I.: architettura, catalogo KPI e pagina introduttiva](./70_MINI_BI_090.md)

- [71. Filtri periodo e servizio aggregazioni B.I.](./71_MINI_BI_FILTRI_091.md)

- [72. Vista B.I. Vendite](./72_MINI_BI_VENDITE_092.md)

- [73. Vista B.I. Acquisti](./73_MINI_BI_ACQUISTI_093.md)

- [74. Vista B.I. Contabilità operativa](./74_MINI_BI_CONTABILITA_094.md)

- [75. Vista B.I. Magazzino](./75_MINI_BI_MAGAZZINO_095.md)

- [76. Vista Direzione / Amministrazione](./76_MINI_BI_DIREZIONE_096.md)

- [77. Vista Didattica / Docente e scenari B.I.](./77_MINI_BI_DIDATTICA_097.md)

- [78. QA, performance browser e pacchetto stabile mini B.I.](./78_MINI_BI_QA_098.md)

## Ultime release

- **0.11.6**: Stabilizzazione Mini B.I. e QA regressione ruoli.
- **0.10.6**: Hotfix tab Mini B.I. e rendering aree.
- **0.10.5**: QA sicurezza B.I. e pacchetto stabile permessi.
- **0.8.12**: Consolidamento dati, test e report prima della mini B.I.
- **0.8.11**: Test finale riorganizzazione menu.
- **0.8.10**: Documentazione della nuova struttura menu.
- **0.8.9**: Aiuto contestuale riallineato alla nuova struttura menu.
- **0.8.8**: Guida menu aggiornata alla nuova organizzazione.
- **0.8.7**: Riorganizzazione menu: impostazioni, organizzazione, didattica e amministrazione.
- **0.8.6**: Micro rifinitura brand e Dark Mode più pulita.
- **0.8.5**: Toggle Dark Mode su una riga e logo più leggibile al buio.
- **0.8.4**: Sidebar più chiara, compatta e coerente col tema.
- **0.8.3**: Ripristino icona classica e visibilità Dark Mode.
- **0.8.2**: Pulizia estetica login, home e sidebar.
- **0.8.1**: Rifinitura branding, naming uniforme e favicon ottimizzata.
- **0.8.0**: Branding applicativo, nome esteso e favicon.
- **0.7.9**: Correzione apertura guida contestuale con pulsante ?.
- **0.7.8**: Guida completa alle voci di menu e aiuto contestuale.
- **0.7.5**: Pacchetto stabile per uso in classe, collaudo finale e checklist docente.
- **0.7.4**: Dataset demo, scenari didattici e casi d’uso guidati.
- **0.7.3**: Miglioramento UX, testi di aiuto, onboarding e messaggi di errore.
- **0.7.2**: Manuale d’uso completo e guida didattica docente/studente.
- **0.7.1**: QA funzionale end-to-end e correzione regressioni operative.
- **0.7.0**: Consolidamento tecnico generale e pulizia regressioni.
- **0.6.6**: Audit sicurezza, report utenti e QA accessi.
- **0.6.5**: Regole Firestore rafforzate su ruoli, profili e operazioni sensibili.
- **0.6.4**: Override permessi per singolo utente.
- **0.6.3**: Matrice permessi moduli.
- **0.6.2**: Profili permesso configurabili per gruppo.
- **0.6.1**: Inviti avanzati e onboarding collaboratori.
- **0.6.0**: Bootstrap superadmin e registrazione con invito.
- **0.5.6**: Migrazione guidata, backup 0.5.x e QA multiutente.
- **0.5.5**: Console docente e simulazioni di gruppo.
- **0.5.4**: Controllo concorrenza e scritture sicure.
- **0.5.3**: Regole Firestore per gruppi e ruoli.
- **0.5.2**: Permessi UI e visibilità menu per ruolo.
- **0.5.1**: Membri, inviti e ruoli per Gruppi aziendali.
- **0.5.0**: Gruppi aziendali condivisi.
- **0.4.8**: Correzione select dinamiche soggetti.
- **0.4.7**: Dark Mode form e combo.
- **0.4.6**: correzione accessibilità form e pulsanti.
- **0.4.5**: bilancino gestionale semplificato.
- **0.4.4**: consolidamento UX e accessibilità.
- **0.4.3**: registro attività / audit trail applicativo.
- **0.4.2**: workflow approvativi leggeri.
- **0.4.1**: centro notifiche operativo.
- **0.4.0**: stampe e PDF HTML avanzati.
- **0.3.7**: consolidamento QA, UX e coerenza contabile trasversale.
- **0.3.6**: budget, costi e marginalità avanzata.
- **0.3.5**: riconciliazione pagamenti.
- **0.3.4**: solleciti e promemoria scadenze.
- **0.3.3**: estratto conto cliente/fornitore.
- **0.3.2**: prima nota.
- **0.3.1**: incassi e pagamenti evoluti.
- **0.3.0**: partitario clienti e fornitori.

- [53 - Chiarimento Superadmin e inviti studenti 0.7.6](53_CHIARIMENTO_SUPERADMIN_INVITI_076.md)

- [54. Correzione bootstrap Superadmin 0.7.7](54_CORREZIONE_BOOTSTRAP_SUPERADMIN_077.md)

- [55. Guida completa alle voci di menu e aiuto contestuale 0.7.8](55_GUIDA_MENU_COMPLETA_078.md)
- [56. Correzione aiuto contestuale 0.7.9](56_CORREZIONE_AIUTO_CONTESTUALE_079.md)
- [57. Identità visiva, nome esteso e favicon 0.8.0](57_IDENTITA_VISIVA_080.md)
- [58. Rifinitura branding e uniformazione naming 0.8.1](58_RIFINITURA_BRANDING_081.md)
- [59. Pulizia estetica login, home e sidebar 0.8.2](59_PULIZIA_ESTETICA_082.md)
- [60. Ripristino icona classica e Dark Mode 0.8.3](60_ICONA_CLASSICA_DARKMODE_083.md)
- [61. Sidebar più chiara e compatta 0.8.4](61_SIDEBAR_UI_084.md)
- [62. Toggle Dark Mode e logo Dark Mode 0.8.5](62_TOGGLE_LOGO_DARKMODE_085.md)
- [63. Micro rifinitura brand e Dark Mode pulita 0.8.6](63_BRAND_MICRO_REFINE_086.md)


## Mini B.I. 0.10.x — Permessi granulari

- [79_MINI_BI_PERMESSI_0100](79_MINI_BI_PERMESSI_0100.md)
- [80_MINI_BI_VISIBILITA_RUOLO_0101](80_MINI_BI_VISIBILITA_RUOLO_0101.md)
- [81_MINI_BI_PANORAMICA_ADATTIVA_0102](81_MINI_BI_PANORAMICA_ADATTIVA_0102.md)
- [82_MINI_BI_DIDATTICA_PERMESSI_0103](82_MINI_BI_DIDATTICA_PERMESSI_0103.md)
- [83_MINI_BI_AUDIT_OPZIONALE_0104](83_MINI_BI_AUDIT_OPZIONALE_0104.md)
- [84_MINI_BI_QA_PERMESSI_0105](84_MINI_BI_QA_PERMESSI_0105.md)

- [85. Mini B.I. 0.10.6 — Hotfix tab e rendering aree](85_MINI_BI_HOTFIX_TAB_0106.md)
- [86. Mini B.I. 0.11.6 — Stabilizzazione e QA regressione ruoli](86_MINI_BI_STABILIZZAZIONE_QA_0107.md)

## Mini B.I. operativa 0.11.x

- [87 - Mini B.I. drill-down KPI 0.11.0](87_MINI_BI_DRILLDOWN_0110.md)
- [88 - Mini B.I. filtri dettaglio 0.11.1](88_MINI_BI_FILTRI_DETTAGLIO_0111.md)
- [89 - Mini B.I. export CSV 0.11.2](89_MINI_BI_EXPORT_CSV_0112.md)
- [90 - Mini B.I. report print 0.11.3](90_MINI_BI_REPORT_PRINT_0113.md)
- [91 - Mini B.I. alert operativi 0.11.4](91_MINI_BI_ALERT_OPERATIVI_0114.md)
- [92 - Mini B.I. cruscotto operativo 0.11.5](92_MINI_BI_CRUSCOTTO_OPERATIVO_0115.md)
- [93 - Mini B.I. QA performance 0.11.6](93_MINI_BI_QA_PERFORMANCE_0116.md)

## Segnalazioni operative 0.12.x

- [94 - Fondazione segnalazioni operative 0.12.0](94_SEGNALAZIONI_OPERATIVE_0120.md)
- [95 - Workflow operativo e presa in carico 0.12.1](95_SEGNALAZIONI_WORKFLOW_0121.md)
- [96 - Collegamenti a prodotti, soggetti e documenti 0.12.2](96_SEGNALAZIONI_COLLEGAMENTI_0122.md)
- [97 - Creazione contestuale da aree operative 0.12.3](97_SEGNALAZIONI_CONTESTUALI_0123.md)
- [98 - Comunicazioni interne simulate 0.12.4](98_SEGNALAZIONI_COMUNICAZIONI_0124.md)
- [99 - Modulistica operativa stampabile 0.12.5](99_SEGNALAZIONI_STAMPA_0125.md)
- [100 - Integrazione Mini B.I. e alert operativi 0.12.6](100_SEGNALAZIONI_BI_0126.md)
- [101 - Scenari di simulazione aziendale 0.12.7](101_SEGNALAZIONI_SCENARI_0127.md)
- [102 - QA e pacchetto stabile segnalazioni operative 0.12.8](102_SEGNALAZIONI_QA_0128.md)
- [103 - Hotfix operativo segnalazioni 0.12.9](103_SEGNALAZIONI_HOTFIX_OPERATIVO_0129.md)

- [104 - Segnalazioni operative collegamenti guidati 0.12.10](104_SEGNALAZIONI_COLLEGAMENTI_GUIDATI_01210.md)

- [105 - Workflow approvativo operativo 0.12.11](105_WORKFLOW_APPROVATIVO_OPERATIVO_01211.md)
- [106 - Segnalazioni operative: hotfix filtri 0.12.12](106_SEGNALAZIONI_FILTRI_HOTFIX_01212.md)

- [107 - UX segnalazioni, conversione preventivi e quantità 0.12.13](107_UX_SEGNALAZIONI_PREVENTIVI_QTA_01213.md)
