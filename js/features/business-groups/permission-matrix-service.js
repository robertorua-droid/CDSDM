// js/features/business-groups/permission-matrix-service.js
// CDSDM 0.6.4 — Matrice permessi moduli: catalogo menu/azioni e livelli none/read/write/admin.

(function () {
  const win = window;
  const VERSION = '0.6.6';
  const LEVELS = ['none', 'read', 'write', 'admin'];
  const LEVEL_LABELS = {
    none: 'Nessun accesso',
    read: 'Sola lettura',
    write: 'Lettura/Scrittura',
    admin: 'Admin modulo'
  };

  const DEFAULT_ACTIONS = {
    none: { canOpenMenu: false, canViewData: false, canCreate: false, canEdit: false, canDelete: false, canExport: false, canImport: false, canConfigure: false },
    read: { canOpenMenu: true, canViewData: true, canCreate: false, canEdit: false, canDelete: false, canExport: true, canImport: false, canConfigure: false },
    write: { canOpenMenu: true, canViewData: true, canCreate: true, canEdit: true, canDelete: false, canExport: true, canImport: false, canConfigure: false },
    admin: { canOpenMenu: true, canViewData: true, canCreate: true, canEdit: true, canDelete: true, canExport: true, canImport: true, canConfigure: true }
  };

  const MODULE_CATALOG = [
    { id: 'customers', label: 'Clienti', category: 'Anagrafiche', scope: 'customers', targets: ['anagrafica-clienti'], description: 'Anagrafica clienti e dati commerciali.' },
    { id: 'suppliers', label: 'Fornitori', category: 'Anagrafiche', scope: 'suppliers', targets: ['anagrafica-fornitori'], description: 'Anagrafica fornitori.' },
    { id: 'products', label: 'Prodotti e servizi', category: 'Anagrafiche', scope: 'products', targets: ['anagrafica-prodotti'], description: 'Catalogo prodotti, servizi e costi.' },
    { id: 'sales', label: 'Vendite', category: 'Documenti vendita', scope: 'sales', targets: ['preventivi','ordini-cliente','ddt-cliente','fatturazione-ddt-cliente'], description: 'Preventivi, ordini cliente, DDT cliente e accorpamenti vendita.' },
    { id: 'invoices', label: 'Fatture e note di credito', category: 'Documenti vendita', scope: 'invoices', targets: ['nuova-fattura-accompagnatoria','elenco-fatture'], description: 'Fatturazione cliente, note credito, export e stampe.' },
    { id: 'purchases', label: 'Acquisti', category: 'Documenti acquisto', scope: 'purchases', targets: ['ordini-fornitore','ddt-fornitore','nuovo-acquisto','elenco-acquisti'], description: 'Ordini fornitore, DDT ricevuti e fatture acquisto.' },
    { id: 'warehouse', label: 'Magazzino', category: 'Magazzino', scope: 'warehouse', targets: ['magazzino-giacenza-prodotto','magazzino-giacenze','magazzino-inventario-fisico','magazzino-inventario','magazzino-lotti','magazzino-movimenti','magazzino-quarantena','magazzino-macerati'], description: 'Giacenze, movimenti, lotti, inventario e quarantena.' },
    { id: 'accounting', label: 'Contabilità', category: 'Contabilità', scope: 'accounting', targets: ['partitario','incassi-pagamenti','prima-nota','estratto-conto','solleciti','riconciliazione-banca','bilancino','scadenziario','registri-iva','tabella-iva','tabella-pagamenti','banche-aziendali','budget-marginalita'], description: 'Pagamenti, prima nota, scadenziario, registri IVA e bilancino.' },
    { id: 'projects', label: 'Commesse e timesheet', category: 'Produzione', scope: 'projects', targets: ['commesse','progetti','timesheet','export-timesheet'], description: 'Commesse, progetti, timesheet ed export ore.' },
    { id: 'reports', label: 'Report e simulazioni', category: 'Analisi', scope: 'reports', targets: ['mini-bi','statistiche','report-gestionali','simulazione-ordinario','simulazione-lm'], description: 'Dashboard, Mini B.I., report gestionali e simulazioni fiscali.' },
    { id: 'workflow', label: 'Workflow e notifiche', category: 'Operatività', scope: 'workflow', targets: ['centro-notifiche','workflow-approvativi'], description: 'Centro notifiche e workflow approvativi leggeri.' },
    { id: 'operationalReports', label: 'Segnalazioni operative', category: 'Operatività', scope: 'operationalReports', targets: ['operational-reports'], description: 'Anomalie operative, comunicazioni interne simulate e modulistica stampabile.' },
    { id: 'audit', label: 'Audit trail', category: 'Controllo', scope: 'audit', targets: ['audit-trail'], description: 'Registro attività e tracciamento eventi.' },
    { id: 'print', label: 'Centro stampe', category: 'Operatività', scope: 'print', targets: ['centro-stampe'], description: 'Template e stampe HTML/PDF.' },
    { id: 'import', label: 'Import massivi', category: 'Dati', scope: 'import', targets: ['import-massivi'], description: 'Import CSV didattici e caricamenti massivi.' },
    { id: 'settings', label: 'Impostazioni operative', category: 'Sistema', scope: 'settings', targets: ['anagrafica-azienda','uso-dati','ux-accessibilita'], description: 'Azienda, UX/accessibilità e configurazioni operative.' },
    { id: 'permissions', label: 'Utenti, ruoli e permessi', category: 'Sistema', scope: 'permissions', targets: ['ruoli-permessi','profili-permesso','matrice-permessi','superadmin','gruppi-aziendali'], description: 'Gestione Gruppi aziendali, membri, ruoli, profili e matrice permessi.' },
    { id: 'securityAudit', label: 'Audit sicurezza e QA accessi', category: 'Sistema', scope: 'securityAudit', targets: ['audit-sicurezza'], description: 'Report sicurezza, QA accessi, inviti, profili e permessi effettivi.' },
    { id: 'teacherConsole', label: 'Console docente', category: 'Didattica', scope: 'teacherConsole', targets: ['console-docente'], description: 'Scenari, simulazioni di gruppo e supervisione docente.' },
    { id: 'migrationQa', label: 'Migrazione e QA', category: 'Didattica', scope: 'migrationQa', targets: ['migrazione-qa'], description: 'Migrazione legacy e QA multiutente.' },
    { id: 'danger', label: 'Gestione dati / reset', category: 'Sistema', scope: 'danger', targets: ['avanzate'], description: 'Backup, import, reset e funzioni distruttive.' }
  ];

  function db() {
    const candidate = win.db || (typeof globalThis !== 'undefined' ? globalThis.db : null);
    if (candidate && typeof candidate.collection === 'function') return candidate;
    if (win.firebase && typeof win.firebase.firestore === 'function') {
      const compat = win.firebase.firestore();
      if (compat && typeof compat.collection === 'function') {
        win.db = compat;
        if (typeof globalThis !== 'undefined') globalThis.db = compat;
        return compat;
      }
    }
    throw new Error('Firestore non inizializzato: ricarica l’app e verifica la configurazione Firebase.');
  }
  function uid() { return win.currentUser && win.currentUser.uid ? win.currentUser.uid : ''; }
  function nowIso() { return new Date().toISOString(); }
  function activeGroupId(groupId) { return groupId || (win.currentBusinessGroup && win.currentBusinessGroup.id) || ''; }
  function groupRef(groupId) { return db().collection('businessGroups').doc(String(groupId)); }
  function matrixRef(groupId) { return groupRef(groupId).collection('permissionMatrices').doc('moduleMatrix'); }
  function isManager() { return win.BusinessGroupsService && win.BusinessGroupsService.canManageActiveGroup && win.BusinessGroupsService.canManageActiveGroup(); }
  function normalizeLevel(level) { const v = String(level || '').trim(); return LEVELS.indexOf(v) >= 0 ? v : 'none'; }

  function normalizeActions(input) {
    const raw = input && typeof input === 'object' ? input : {};
    return {
      canOpenMenu: raw.canOpenMenu === true,
      canViewData: raw.canViewData === true,
      canCreate: raw.canCreate === true,
      canEdit: raw.canEdit === true,
      canDelete: raw.canDelete === true,
      canExport: raw.canExport === true,
      canImport: raw.canImport === true,
      canConfigure: raw.canConfigure === true
    };
  }

  function actionsForLevel(level) { return Object.assign({}, DEFAULT_ACTIONS[normalizeLevel(level)] || DEFAULT_ACTIONS.none); }

  function defaultMatrix() {
    const modules = {};
    MODULE_CATALOG.forEach(m => {
      modules[m.id] = {
        id: m.id,
        scope: m.scope,
        label: m.label,
        category: m.category,
        targets: (m.targets || []).slice(),
        description: m.description || '',
        defaultLevel: 'read',
        actionModel: {
          none: actionsForLevel('none'),
          read: actionsForLevel('read'),
          write: actionsForLevel('write'),
          admin: actionsForLevel('admin')
        }
      };
    });
    return { id: 'moduleMatrix', version: VERSION, modules };
  }

  function normalizeMatrix(input) {
    const base = defaultMatrix();
    const rawModules = input && input.modules && typeof input.modules === 'object' ? input.modules : {};
    Object.keys(base.modules).forEach(id => {
      const raw = rawModules[id] || {};
      const current = base.modules[id];
      current.defaultLevel = normalizeLevel(raw.defaultLevel || current.defaultLevel);
      if (raw.actionModel && typeof raw.actionModel === 'object') {
        LEVELS.forEach(level => {
          current.actionModel[level] = normalizeActions(Object.assign({}, actionsForLevel(level), raw.actionModel[level] || {}));
        });
      }
      if (Array.isArray(raw.targets) && raw.targets.length) current.targets = raw.targets.map(String);
      if (raw.description) current.description = String(raw.description);
    });
    return Object.assign({}, base, {
      version: (input && input.version) || VERSION,
      updatedAt: input && input.updatedAt || '',
      updatedBy: input && input.updatedBy || ''
    });
  }

  async function loadMatrix(groupId) {
    const gid = activeGroupId(groupId);
    if (!gid || !db()) return defaultMatrix();
    const doc = await matrixRef(gid).get();
    return doc.exists ? normalizeMatrix(Object.assign({ id: doc.id }, doc.data() || {})) : defaultMatrix();
  }

  async function saveMatrix(groupId, payload) {
    const gid = activeGroupId(groupId);
    if (!gid) throw new Error('Seleziona un Gruppo aziendale.');
    if (!isManager()) throw new Error('Solo admin/teacher possono modificare la matrice permessi.');
    const matrix = normalizeMatrix(payload || {});
    const doc = Object.assign({}, matrix, { id: 'moduleMatrix', version: VERSION, updatedAt: nowIso(), updatedBy: uid() });
    await matrixRef(gid).set(doc, { merge: true });
    await groupRef(gid).set({ updatedAt: nowIso(), updatedBy: uid(), version: VERSION, schemaVersion: 'businessGroups-0.6.4' }, { merge: true });
    await log('permission_matrix_saved', { moduleCount: Object.keys(doc.modules || {}).length });
    return doc;
  }

  async function resetMatrix(groupId) {
    const gid = activeGroupId(groupId);
    if (!gid) throw new Error('Seleziona un Gruppo aziendale.');
    return saveMatrix(gid, defaultMatrix());
  }

  function getModuleByScope(scope) { return MODULE_CATALOG.find(m => m.scope === scope || m.id === scope) || null; }
  function getModuleByTarget(target) { return MODULE_CATALOG.find(m => (m.targets || []).indexOf(String(target || '')) >= 0) || null; }

  function evaluateAction(level, action, matrix, moduleId) {
    const m = normalizeMatrix(matrix || defaultMatrix()).modules[moduleId] || null;
    const l = normalizeLevel(level);
    const model = m && m.actionModel && m.actionModel[l] ? m.actionModel[l] : actionsForLevel(l);
    return model[action] === true;
  }

  async function log(action, details) {
    try {
      const gid = activeGroupId();
      if (!gid || !db()) return;
      const ref = groupRef(gid).collection('auditEvents').doc();
      await ref.set({
        id: ref.id,
        type: 'permissions',
        action,
        area: 'Matrice permessi moduli',
        actorUid: uid(),
        actorEmail: win.currentUser && win.currentUser.email ? win.currentUser.email : '',
        date: nowIso().slice(0, 10),
        createdAt: nowIso(),
        details: details || {},
        version: VERSION
      }, { merge: true });
    } catch (e) {
      console.warn('Audit matrice permessi non registrato:', e);
    }
  }

  win.PermissionMatrixService = {
    VERSION,
    LEVELS,
    LEVEL_LABELS,
    DEFAULT_ACTIONS,
    MODULE_CATALOG,
    actionsForLevel,
    defaultMatrix,
    normalizeMatrix,
    loadMatrix,
    saveMatrix,
    resetMatrix,
    getModuleByScope,
    getModuleByTarget,
    evaluateAction
  };
})();
