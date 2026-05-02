// js/features/business-groups/migration-qa-service.js
// CDSDM 0.5.6 — Migrazione guidata e QA multiutente

(function () {
  const win = window;
  const VERSION = '0.5.6';

  const QA_STEPS = [
    { area: 'Accesso', check: 'Accedere con almeno due account Firebase diversi.', expected: 'Ogni account vede solo i gruppi in cui ha membership attiva.' },
    { area: 'Gruppo', check: 'Selezionare lo stesso Gruppo aziendale da due browser/profili.', expected: 'Entrambi leggono lo stesso dataset businessGroups/{groupId}.' },
    { area: 'Ruoli', check: 'Assegnare ruoli sales, accounting, warehouse e readonly.', expected: 'Menu e pulsanti seguono PermissionsPolicy, con readonly senza scritture UI.' },
    { area: 'Firestore', check: 'Pubblicare firestore.rules e provare lettura/scrittura fuori gruppo.', expected: 'Accessi non autorizzati bloccati lato Firestore.' },
    { area: 'Migrazione', check: 'Copiare i dati legacy in un gruppo vuoto e verificare conteggi.', expected: 'I dati legacy restano in users/{uid}; il gruppo contiene una copia separata.' },
    { area: 'Concorrenza', check: 'Modificare lo stesso documento da due sessioni.', expected: 'docVersion/updatedBy permettono di riconoscere conflitti e origine scrittura.' },
    { area: 'Backup', check: 'Esportare e reimportare backup dal gruppo attivo.', expected: 'Backup usa persistenceScope=businessGroup e include collezioni 0.5.x.' },
    { area: 'Console docente', check: 'Creare scenario, avviarlo, completarlo e copiare report.', expected: 'Scenario ed eventi restano nel dataset del gruppo.' }
  ];

  function str(v) { return String(v == null ? '' : v).trim(); }
  function nowIso() { return new Date().toISOString(); }
  function dataCollections() { return win.CDSDM_DATA_COLLECTIONS || (win.DomainConstants && win.DomainConstants.DATA_COLLECTIONS) || []; }
  function activeGroupId() { return win.currentBusinessGroup && win.currentBusinessGroup.id ? String(win.currentBusinessGroup.id) : ''; }
  function groupRef(groupId) { return db.collection('businessGroups').doc(String(groupId)); }
  function legacyRef() { return db.collection('users').doc(win.currentUser.uid); }
  function roleId() {
    if (win.PermissionsPolicy && typeof win.PermissionsPolicy.getCurrentRole === 'function') {
      const role = win.PermissionsPolicy.getCurrentRole();
      return role && role.id ? role.id : 'readonly';
    }
    const g = win.currentBusinessGroup || {};
    return g.role || (g.membership && g.membership.role) || 'readonly';
  }
  function canUse() { return ['admin', 'teacher'].indexOf(roleId()) >= 0; }
  function assertContext() {
    if (!win.currentUser) throw new Error('Utente non autenticato.');
    const gid = activeGroupId();
    if (!gid) throw new Error('Seleziona un Gruppo aziendale prima della migrazione guidata.');
    if (!canUse()) throw new Error('Migrazione guidata disponibile solo per Amministratore o Docente/Revisore.');
    return gid;
  }

  async function countDocs(rootRef, collectionName) {
    try {
      const snap = await rootRef.collection(collectionName).get();
      return (snap.docs || []).length;
    } catch (e) {
      console.warn('Conteggio non disponibile per ' + collectionName, e);
      return null;
    }
  }

  async function hasCompanyInfo(rootRef) {
    try {
      const snap = await rootRef.collection('settings').doc('companyInfo').get();
      return snap.exists;
    } catch (e) { return false; }
  }

  async function collectCounts(rootRef) {
    const counts = { settingsCompanyInfo: await hasCompanyInfo(rootRef), collections: {}, totalRecords: 0 };
    for (const col of dataCollections()) {
      const n = await countDocs(rootRef, col);
      counts.collections[col] = n;
      if (typeof n === 'number') counts.totalRecords += n;
    }
    return counts;
  }

  function compareCounts(legacyCounts, groupCounts) {
    const rows = [];
    dataCollections().forEach(col => {
      const legacy = legacyCounts.collections[col];
      const group = groupCounts.collections[col];
      const diff = (typeof legacy === 'number' && typeof group === 'number') ? group - legacy : null;
      rows.push({ collection: col, legacy, group, diff, status: diff === 0 ? 'aligned' : ((group || 0) === 0 && (legacy || 0) > 0 ? 'missing' : 'check') });
    });
    return rows;
  }

  async function buildReadinessReport() {
    if (!win.currentUser) throw new Error('Utente non autenticato.');
    const gid = activeGroupId();
    const group = win.currentBusinessGroup || null;
    const legacyCounts = await collectCounts(legacyRef());
    const groupCounts = gid ? await collectCounts(groupRef(gid)) : { settingsCompanyInfo: false, collections: {}, totalRecords: 0 };
    const comparison = gid ? compareCounts(legacyCounts, groupCounts) : [];
    const memberships = win.BusinessGroupsService && win.BusinessGroupsService.listMemberships ? await win.BusinessGroupsService.listMemberships() : [];
    const members = gid && win.BusinessGroupsService && win.BusinessGroupsService.listMembers ? await win.BusinessGroupsService.listMembers(gid) : [];
    const activeMembers = members.filter(m => (m.status || 'active') === 'active');
    const role = roleId();
    const groupHasData = !!(groupCounts.settingsCompanyInfo || groupCounts.totalRecords > 0);
    const legacyHasData = !!(legacyCounts.settingsCompanyInfo || legacyCounts.totalRecords > 0);
    const recommendations = [];
    if (!gid) recommendations.push('Seleziona o crea un Gruppo aziendale prima di migrare dati condivisi.');
    if (gid && !legacyHasData) recommendations.push('Non risultano dati legacy da copiare per l’utente corrente.');
    if (gid && legacyHasData && !groupHasData) recommendations.push('Il gruppo sembra vuoto: puoi usare la copia prudente dati legacy → gruppo.');
    if (gid && legacyHasData && groupHasData) recommendations.push('Il gruppo contiene già dati: esegui un backup e confronta i conteggi prima di copiare altri dati.');
    if (gid && activeMembers.length < 2) recommendations.push('Per QA multiutente aggiungi almeno un secondo membro al gruppo.');
    if (gid && role === 'readonly') recommendations.push('Il ruolo readonly può verificare la lettura, ma non eseguire migrazioni.');
    return {
      version: VERSION,
      generatedAt: nowIso(),
      userId: win.currentUser.uid,
      userEmail: win.currentUser.email || '',
      activeGroup: group ? { id: gid, name: group.name || gid, role } : null,
      memberships: memberships.map(m => ({ groupId: m.groupId, groupName: m.groupName, role: m.role, status: m.status })),
      members: activeMembers.map(m => ({ uid: m.uid, email: m.email || '', role: m.role, status: m.status || 'active' })),
      legacyCounts,
      groupCounts,
      comparison,
      checklist: buildChecklist({ gid, legacyHasData, groupHasData, activeMembers, role }),
      recommendations
    };
  }

  function buildChecklist(ctx) {
    return [
      { id: 'group-selected', label: 'Gruppo aziendale attivo selezionato', ok: !!ctx.gid },
      { id: 'legacy-preserved', label: 'I dati legacy restano sotto users/{uid}', ok: true },
      { id: 'legacy-source', label: 'Dati legacy disponibili per eventuale copia', ok: !!ctx.legacyHasData },
      { id: 'group-target', label: 'Dataset gruppo già inizializzato', ok: !!ctx.groupHasData },
      { id: 'role-can-migrate', label: 'Ruolo autorizzato alla migrazione guidata', ok: ['admin', 'teacher'].indexOf(ctx.role) >= 0 },
      { id: 'multiuser-ready', label: 'Almeno due membri attivi per QA multiutente', ok: (ctx.activeMembers || []).length >= 2 },
      { id: 'rules-file-present', label: 'firestore.rules incluso nel pacchetto', ok: true },
      { id: 'backup-before-change', label: 'Backup JSON consigliato prima di reset/import', ok: false, manual: true }
    ];
  }

  async function createMigrationReport() {
    const gid = assertContext();
    const report = await buildReadinessReport();
    const ref = groupRef(gid).collection('migrationReports').doc();
    const payload = {
      id: ref.id,
      type: 'migration-readiness',
      title: 'Report migrazione guidata 0.5.6',
      createdAt: nowIso(),
      createdBy: win.currentUser.uid,
      createdByEmail: win.currentUser.email || '',
      version: VERSION,
      schemaVersion: 'migrationQa-0.5.6',
      report
    };
    await ref.set(payload, { merge: true });
    return payload;
  }

  async function listMigrationReports(groupId) {
    const gid = groupId || activeGroupId();
    if (!gid) return [];
    const snap = await groupRef(gid).collection('migrationReports').get();
    const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() || {}) }));
    rows.sort((a, b) => str(b.createdAt).localeCompare(str(a.createdAt)));
    return rows;
  }

  async function copyLegacyToActiveGroup(options) {
    const gid = assertContext();
    const opts = options || {};
    const before = await buildReadinessReport();
    if (!before.legacyCounts || (!before.legacyCounts.settingsCompanyInfo && before.legacyCounts.totalRecords <= 0)) {
      throw new Error('Non risultano dati legacy da copiare per l’utente corrente.');
    }
    if ((before.groupCounts && (before.groupCounts.settingsCompanyInfo || before.groupCounts.totalRecords > 0)) && opts.skipIfTargetHasData !== false) {
      throw new Error('Il gruppo contiene già dati. Usa la copia solo dopo backup/verifica, oppure abilita esplicitamente la sovrascrittura controllata.');
    }
    const result = await win.BusinessGroupsService.copyLegacyDataToGroup(gid, { skipIfTargetHasData: opts.skipIfTargetHasData !== false });
    const after = await buildReadinessReport();
    const ref = groupRef(gid).collection('migrationReports').doc();
    const payload = {
      id: ref.id,
      type: 'legacy-copy-result',
      title: 'Esito copia legacy → gruppo 0.5.6',
      createdAt: nowIso(),
      createdBy: win.currentUser.uid,
      createdByEmail: win.currentUser.email || '',
      version: VERSION,
      schemaVersion: 'migrationQa-0.5.6',
      before,
      result,
      after
    };
    await ref.set(payload, { merge: true });
    return payload;
  }

  function buildQaPlan() {
    return {
      version: VERSION,
      generatedAt: nowIso(),
      activeGroupId: activeGroupId(),
      steps: QA_STEPS
    };
  }

  win.MigrationQaService = {
    VERSION,
    QA_STEPS,
    canUse,
    buildReadinessReport,
    createMigrationReport,
    listMigrationReports,
    copyLegacyToActiveGroup,
    buildQaPlan
  };
})();
