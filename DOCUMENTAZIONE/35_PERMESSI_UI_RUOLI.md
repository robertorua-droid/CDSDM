# Permessi UI e visibilità menu — versione 0.5.2

La versione **0.5.2** introduce l'applicazione operativa dei ruoli dei **Gruppi aziendali** all'interfaccia utente.

## Obiettivo

Rendere la simulazione multiutente più realistica: ogni studente vede e usa prevalentemente le sezioni coerenti con il proprio ruolo nel gruppo condiviso.

Esempio:

```text
Gruppo aziendale: Alfa S.r.l.
- Anna: admin       -> vede e gestisce tutto
- Marco: sales      -> vendite, clienti, ordini cliente, DDT cliente, fatture cliente
- Giulia: accounting -> contabilità, fatture, incassi, pagamenti, registri, bilancino
- Luca: warehouse   -> prodotti, magazzino, lotti, movimenti, DDT operativi
- Prof.ssa Rossi: teacher -> supervisione didattica completa
```

## Fonte del ruolo

Quando è attivo un Gruppo aziendale, il ruolo deriva dalla membership:

```text
businessGroups/{groupId}/members/{uid}.role
```

Quando non è attivo un Gruppo aziendale, l'app mantiene la compatibilità legacy con:

```text
businessGroups non attivo -> users/{uid}/settings/companyInfo.accessControl
```

## Ruoli gestiti

```text
admin       -> Amministratore
teacher     -> Docente/Revisore
accounting  -> Contabilità
sales       -> Vendite
purchases   -> Acquisti
warehouse   -> Magazzino
readonly    -> Sola lettura
```

Sono mantenute alias legacy:

```text
commerciale -> sales
magazzino   -> warehouse
contabilita -> accounting
```

## Cosa controlla la 0.5.2

La nuova `PermissionsPolicy` centralizza:

- definizione ruoli;
- sezioni accessibili per ruolo;
- scope di scrittura;
- mapping tra `data-target` del menu e scope applicativo;
- visibilità voci di menu;
- disabilitazione pulsanti di creazione, salvataggio, import, reset, approvazione o cancellazione quando il ruolo non può scrivere nello scope corrente;
- messaggi utente di operazione non consentita.

## Esempi di scope

```text
sales      -> preventivi, ordini cliente, DDT cliente, fatture cliente, clienti
accounting -> fatture, acquisti, incassi/pagamenti, prima nota, registri, bilancino
purchases  -> fornitori, ordini fornitore, DDT fornitore, acquisti
warehouse  -> prodotti, giacenze, inventario, lotti, movimenti, quarantena
readonly   -> consultazione senza scrittura
```

## Pagina Ruoli e permessi

La pagina **Impostazioni → Ruoli e permessi** resta disponibile per compatibilità legacy.

Con un Gruppo aziendale attivo:

- mostra il ruolo effettivo del gruppo;
- disabilita il cambio ruolo legacy;
- invita a modificare il ruolo dalla schermata **Gruppi aziendali**.

Senza Gruppo aziendale attivo:

- mantiene il comportamento legacy basato su `companyInfo.accessControl`.

## Limiti dichiarati

I permessi UI 0.5.2 sono controlli front-end, utili per didattica e UX, ma non impediscono accessi diretti ai dati Firestore se le regole database non sono deployate e coerenti.

La sicurezza reale è stata introdotta nella release successiva 0.5.3 tramite il file `firestore.rules`, da deployare su Firebase Console/CLI.

## Test

È stato aggiunto il test browser-based:

```text
tests/permissions-052-ui.test.html
```

Il test verifica:

- versione `PermissionsPolicy.VERSION`;
- accesso sezioni per `sales`;
- blocco scrittura contabile per `sales`;
- sola lettura per `readonly`;
- accesso completo per `teacher`.
