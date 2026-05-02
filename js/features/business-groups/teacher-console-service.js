// js/features/business-groups/teacher-console-service.js
// CDSDM 0.5.6 — Console docente e simulazioni di gruppo

(function () {
  const win = window;
  const VERSION = '0.5.6';

  const SCENARIO_TEMPLATES = {
    ciclo_vendite: {
      key: 'ciclo_vendite',
      title: 'Simulazione ciclo vendite',
      area: 'Vendite',
      description: 'Gli studenti simulano preventivo, ordine cliente, DDT e fattura riepilogativa.',
      suggestedRoles: ['teacher', 'sales', 'warehouse', 'accounting'],
      checklist: [
        'Creare o verificare il cliente assegnato.',
        'Preparare un preventivo e approvarlo.',
        'Trasformare l’ordine cliente in DDT.',
        'Generare fattura da DDT e registrare un incasso parziale.'
      ]
    },
    ciclo_acquisti_magazzino: {
      key: 'ciclo_acquisti_magazzino',
      title: 'Simulazione acquisti e magazzino',
      area: 'Acquisti/Magazzino',
      description: 'Il gruppo coordina ordine fornitore, DDT ricevuto, carico merce, quarantena e lotti.',
      suggestedRoles: ['teacher', 'purchases', 'warehouse', 'accounting'],
      checklist: [
        'Creare un ordine fornitore per prodotti inventariabili.',
        'Registrare un DDT fornitore ricevuto.',
        'Aggiornare giacenze, lotti o matricole.',
        'Gestire almeno una voce in quarantena o revisione.'
      ]
    },
    contabilita_scadenze: {
      key: 'contabilita_scadenze',
      title: 'Simulazione contabilità e scadenze',
      area: 'Contabilità',
      description: 'Focus su incassi, pagamenti, scadenziario, prima nota e riconciliazione.',
      suggestedRoles: ['teacher', 'accounting', 'readonly'],
      checklist: [
        'Verificare fatture aperte e scadute.',
        'Registrare incassi/pagamenti con allocazione.',
        'Aggiornare prima nota e partitario.',
        'Controllare bilancino e report.'
      ]
    },
    revisione_docente: {
      key: 'revisione_docente',
      title: 'Revisione docente / audit finale',
      area: 'Revisione',
      description: 'Il docente controlla ruoli, audit, workflow, coerenza contabile e avanzamento gruppo.',
      suggestedRoles: ['teacher', 'readonly'],
      checklist: [
        'Verificare membri e ruoli del gruppo.',
        'Consultare workflow e registro attività.',
        'Controllare documenti collegati e dati contabili.',
        'Annotare esito e punti di miglioramento.'
      ]
    }
  };

  function str(v) { return String(v == null ? '' : v).trim(); }
  function nowIso() { return new Date().toISOString(); }
  function roleId() {
    if (win.PermissionsPolicy && typeof win.PermissionsPolicy.getCurrentRole === 'function') {
      const role = win.PermissionsPolicy.getCurrentRole();
      return role && role.id ? role.id : 'readonly';
    }
    const g = win.currentBusinessGroup || {};
    return g.role || (g.membership && g.membership.role) || 'readonly';
  }
  function canUseTeacherConsole() { return ['admin', 'teacher'].indexOf(roleId()) >= 0; }
  function activeGroupId() { return win.currentBusinessGroup && win.currentBusinessGroup.id ? String(win.currentBusinessGroup.id) : ''; }
  function groupRef(groupId) { return db.collection('businessGroups').doc(String(groupId)); }
  function assertContext() {
    if (!win.currentUser) throw new Error('Utente non autenticato.');
    const gid = activeGroupId();
    if (!gid) throw new Error('Seleziona un Gruppo aziendale prima di usare la Console docente.');
    if (!canUseTeacherConsole()) throw new Error('Console docente disponibile solo per Amministratore o Docente/Revisore.');
    return gid;
  }

  function getCollectionStats() {
    const gd = win.globalData || {};
    const collections = win.CDSDM_DATA_COLLECTIONS || [];
    const stats = {};
    collections.forEach(col => { stats[col] = Array.isArray(gd[col]) ? gd[col].length : 0; });
    return stats;
  }

  async function getDashboard(groupId) {
    const gid = groupId || activeGroupId();
    if (!gid) return null;
    const svc = win.BusinessGroupsService;
    const members = svc && svc.listMembers ? await svc.listMembers(gid) : [];
    const invites = svc && svc.listInvites ? await svc.listInvites(gid) : [];
    const scenarios = await listScenarios(gid);
    const events = await listSimulationEvents(gid, 20);
    const collectionStats = getCollectionStats();
    return {
      groupId: gid,
      groupName: (win.currentBusinessGroup && win.currentBusinessGroup.name) || gid,
      role: roleId(),
      canManage: canUseTeacherConsole(),
      members,
      activeMembers: members.filter(m => (m.status || 'active') === 'active').length,
      pendingInvites: invites.filter(i => (i.status || 'pending') === 'pending').length,
      scenarios,
      activeScenarios: scenarios.filter(s => (s.status || 'draft') === 'active').length,
      completedScenarios: scenarios.filter(s => s.status === 'completed').length,
      events,
      collectionStats
    };
  }

  async function listScenarios(groupId) {
    const gid = groupId || activeGroupId();
    if (!gid) return [];
    const snap = await groupRef(gid).collection('teachingScenarios').get();
    const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() || {}) }));
    rows.sort((a, b) => str(b.updatedAt || b.createdAt).localeCompare(str(a.updatedAt || a.createdAt)));
    return rows;
  }

  async function listSimulationEvents(groupId, limit) {
    const gid = groupId || activeGroupId();
    if (!gid) return [];
    const snap = await groupRef(gid).collection('simulationEvents').get();
    const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() || {}) }));
    rows.sort((a, b) => str(b.createdAt).localeCompare(str(a.createdAt)));
    return limit ? rows.slice(0, limit) : rows;
  }

  async function recordSimulationEvent(groupId, action, details) {
    const gid = groupId || activeGroupId();
    if (!gid || !db) return null;
    const ref = groupRef(gid).collection('simulationEvents').doc();
    const event = {
      id: ref.id,
      type: 'teacherConsole',
      action: str(action),
      details: details || {},
      actorUid: win.currentUser && win.currentUser.uid || '',
      actorEmail: win.currentUser && win.currentUser.email || '',
      createdAt: nowIso(),
      version: VERSION
    };
    await ref.set(event, { merge: true });
    return event;
  }

  function normalizeChecklist(value) {
    if (Array.isArray(value)) return value.map(str).filter(Boolean);
    return str(value).split('\n').map(str).filter(Boolean);
  }

  async function createScenario(groupId, payload) {
    const gid = assertContext();
    const data = payload || {};
    const title = str(data.title);
    if (!title) throw new Error('Inserisci il titolo dello scenario.');
    const ref = groupRef(gid).collection('teachingScenarios').doc();
    const scenario = {
      id: ref.id,
      groupId: gid,
      title,
      area: str(data.area) || 'Didattica',
      description: str(data.description),
      checklist: normalizeChecklist(data.checklist),
      status: data.status || 'draft',
      assignedRoles: Array.isArray(data.assignedRoles) ? data.assignedRoles : [],
      createdAt: nowIso(),
      createdBy: win.currentUser.uid,
      createdByEmail: win.currentUser.email || '',
      updatedAt: nowIso(),
      updatedBy: win.currentUser.uid,
      version: VERSION,
      schemaVersion: 'teacherConsole-0.5.6'
    };
    await ref.set(scenario, { merge: true });
    await recordSimulationEvent(gid, 'scenario_created', { scenarioId: ref.id, title: scenario.title, area: scenario.area });
    return scenario;
  }

  async function createScenarioFromTemplate(templateKey) {
    const tpl = SCENARIO_TEMPLATES[templateKey];
    if (!tpl) throw new Error('Template scenario non valido.');
    return createScenario(activeGroupId(), {
      title: tpl.title,
      area: tpl.area,
      description: tpl.description,
      checklist: tpl.checklist,
      assignedRoles: tpl.suggestedRoles,
      status: 'active'
    });
  }

  async function updateScenarioStatus(groupId, scenarioId, status) {
    const gid = assertContext();
    const sid = str(scenarioId);
    const newStatus = str(status) || 'draft';
    if (!sid) throw new Error('Scenario non valido.');
    const patch = { status: newStatus, updatedAt: nowIso(), updatedBy: win.currentUser.uid, version: VERSION };
    await groupRef(gid).collection('teachingScenarios').doc(sid).set(patch, { merge: true });
    await recordSimulationEvent(gid, 'scenario_status_changed', { scenarioId: sid, status: newStatus });
    return patch;
  }

  async function deleteScenario(groupId, scenarioId) {
    const gid = assertContext();
    const sid = str(scenarioId);
    if (!sid) throw new Error('Scenario non valido.');
    await groupRef(gid).collection('teachingScenarios').doc(sid).delete();
    await recordSimulationEvent(gid, 'scenario_deleted', { scenarioId: sid });
    return true;
  }

  function buildProgressReport(dashboard) {
    const d = dashboard || {};
    const stats = d.collectionStats || {};
    return {
      groupId: d.groupId || activeGroupId(),
      groupName: d.groupName || '',
      generatedAt: nowIso(),
      activeMembers: d.activeMembers || 0,
      pendingInvites: d.pendingInvites || 0,
      scenariosTotal: (d.scenarios || []).length,
      activeScenarios: d.activeScenarios || 0,
      completedScenarios: d.completedScenarios || 0,
      keyCounters: {
        customers: stats.customers || 0,
        suppliers: stats.suppliers || 0,
        products: stats.products || 0,
        invoices: stats.invoices || 0,
        purchases: stats.purchases || 0,
        warehouseMovements: stats.warehouseMovements || 0,
        auditEvents: stats.auditEvents || 0,
        workflowEvents: stats.workflowEvents || 0
      }
    };
  }

  win.TeacherConsoleService = {
    VERSION,
    SCENARIO_TEMPLATES,
    canUseTeacherConsole,
    getDashboard,
    listScenarios,
    listSimulationEvents,
    recordSimulationEvent,
    createScenario,
    createScenarioFromTemplate,
    updateScenarioStatus,
    deleteScenario,
    buildProgressReport
  };
})();
