# 133 — Menu essenziale e visibilità avanzata 0.13.17

## Obiettivo

La versione **0.13.17** ripulisce il menu laterale senza introdurre nuovi flussi applicativi, nuove collezioni Firestore o modifiche alle regole.

L’obiettivo è ridurre l’affollamento e rendere più chiara la differenza tra:

- operatività quotidiana;
- configurazione aziendale;
- gestione dati;
- didattica/QA;
- amministrazione avanzata.

## Voci nascoste o spostate

- **Nuovo Acquisto** non è più voce diretta di menu: resta come pulsante nella pagina **Elenco Acquisti**.
- **Statistiche** viene nascosta dal menu operativo: Mini B.I. e Report gestionali sono i riferimenti principali.
- **UX / accessibilità** viene spostata concettualmente in **Didattica / QA**.
- **Override permessi** resta legacy nascosto, già tracciato dalla 0.13.16.

## Nuove sezioni logiche

La sezione precedente **Impostazioni** viene resa più chiara distinguendo:

```text
Configurazione
- Azienda
- Tabella IVA
- Codici pagamento
- Banche aziendali

Gestione dati
- Uso dati
- Import massivi CSV
- Backup / Import / Reset
```

## Visibilità avanzata

Le funzioni tecniche o amministrative sono marcate con attributi di visibilità menu e controllate lato UI da `PermissionsPolicy`:

```text
data-menu-visibility="admin-teacher-superadmin"
data-menu-visibility="superadmin-only"
```

Questo non sostituisce le regole Firestore: è una pulizia UI e didattica.

## Compatibilità

La 0.13.17 non modifica:

- Firestore;
- `firestore.rules`;
- collezioni;
- inviti;
- profili permesso;
- backend;
- Cloud Functions.

La futura pagina **Vendite → Elenco documenti vendita** non è introdotta in questa release e resta pianificata come step successivo.
