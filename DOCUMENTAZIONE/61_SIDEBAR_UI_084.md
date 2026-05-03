# 61. Sidebar più chiara e compatta 0.8.4

## Obiettivo

La versione **0.8.4** interviene sulla leggibilità del menu laterale, recependo tre esigenze pratiche:

1. rendere più evidente la differenza tra **voci di menu cliccabili** e **separatori/etichette di gruppo**;
2. far percepire meglio la differenza tra **tema chiaro** e **tema scuro** anche nella sidebar;
3. ridurre leggermente l’altezza occupata dalle voci per contenere lo scroll verticale.

## Interventi principali

### 1) Sidebar coerente col tema
- In **Light Mode** la sidebar usa ora una palette chiara e non resta costantemente scura.
- In **Dark Mode** mantiene una palette scura ma più leggibile e più coerente col resto dell’app.

### 2) Separatori più chiaramente “non cliccabili”
Elementi come:

- `Documenti commerciali`;
- `Fatturazione`;
- `Documenti fornitori`;
- `Fatture fornitori`;

sono stati ridisegnati come **etichette/separatori**, con peso visivo inferiore rispetto alle vere voci di menu.

### 3) Compattazione prudente
Sono stati ridotti leggermente:

- padding verticale delle voci menu;
- spaziature dei titoli di sezione;
- ingombro complessivo della sidebar.

L’obiettivo è migliorare la densità senza sacrificare leggibilità o usabilità didattica.

## Compatibilità

La 0.8.4 è una release solo UI/CSS e non cambia:

- logica gestionale;
- dati Firestore;
- regole;
- gruppi/ruoli/permessi;
- backup/import/reset.
