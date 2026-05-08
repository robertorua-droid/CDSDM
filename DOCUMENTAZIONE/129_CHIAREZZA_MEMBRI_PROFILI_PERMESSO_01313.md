# 129 — Chiarezza membri e profili permesso 0.13.13

## Obiettivo

La versione **0.13.13** chiarisce come gestire i privilegi dei collaboratori registrati con invito.

Il modello operativo resta:

```text
Gruppo aziendale → membro → ruolo/profilo permesso → permessi effettivi
```

Non viene usato il fine tuning individuale tramite override.

## Cosa cambia

- La voce legacy **Override permessi** viene nascosta dal menu operativo.
- La pagina **Profili permesso** mostra istruzioni più chiare.
- La pagina **Profili permesso** mostra errori visibili se il gruppo attivo o Firestore non sono disponibili.
- La pagina consente di creare i profili predefiniti e assegnarli ai membri del gruppo.

## Dove modificare i privilegi

Per modificare un collaboratore:

1. entra nel Gruppo aziendale corretto;
2. apri **Organizzazione → Profili permesso**;
3. se non esistono profili, usa **Crea predefiniti**;
4. nella sezione **Assegna profili ai membri**, scegli il profilo per il collaboratore.

La **Matrice permessi** descrive i moduli e i livelli, ma non è la schermata principale per modificare un singolo collaboratore.

## Compatibilità

La 0.13.13 non introduce nuove collezioni Firestore e non modifica `firestore.rules`.
