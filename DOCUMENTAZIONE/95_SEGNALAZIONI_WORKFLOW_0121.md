# 0.12.1 — Workflow operativo e presa in carico

Le segnalazioni operative usano stati semplici:

```text
draft → reported → assigned → in_progress → waiting_info → resolved → closed
```

Lo stato `cancelled` consente l'annullamento controllato. La chiusura/annullamento richiede permessi più elevati lato UI.

Sono disponibili filtri per stato, area, gravità e ricerca testuale.
