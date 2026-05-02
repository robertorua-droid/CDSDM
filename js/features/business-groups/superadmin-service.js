// js/features/business-groups/superadmin-service.js
// CDSDM 0.7.7 — Bootstrap superadmin applicativo tollerante a regole non ancora allineate.

(function () {
  const win = window;
  const VERSION = '0.7.7';
  const SYSTEM_REF = ['appSettings', 'system'];

  function nowIso() { return new Date().toISOString(); }
  function lower(v) { return String(v == null ? '' : v).trim().toLowerCase(); }
  function systemRef() { return db.collection(SYSTEM_REF[0]).doc(SYSTEM_REF[1]); }

  async function readSystemSettings() {
    if (!win.currentUser) return { exists: false, data: null };
    const snap = await systemRef().get();
    return snap.exists ? { exists: true, id: snap.id, data: snap.data() || {} } : { exists: false, data: null };
  }

  function isUserSuperadmin(systemData, user) {
    const current = user || win.currentUser || null;
    if (!current || !systemData) return false;
    const uid = String(current.uid || '');
    const email = lower(current.email || '');
    const emails = Array.isArray(systemData.superadminEmails) ? systemData.superadminEmails.map(lower) : [];
    return String(systemData.superadminUid || '') === uid || emails.indexOf(email) >= 0;
  }

  async function isCurrentUserSuperadmin() {
    const state = await readSystemSettings();
    return state.exists && isUserSuperadmin(state.data, win.currentUser);
  }

  async function claimFirstSuperadmin(options) {
    if (!win.currentUser) throw new Error('Utente non autenticato.');

    // 0.7.7: non bloccare il bootstrap se la LETTURA di appSettings/system è
    // negata da regole Firestore non ancora allineate. La CREATE resta
    // comunque validata dalle rules pubblicate: se il documento non esiste e
    // le rules sono quelle del pacchetto, la scrittura può riuscire anche senza
    // una lettura preventiva riuscita.
    try {
      const state = await readSystemSettings();
      if (state.exists) throw new Error('Superadmin già inizializzato.');
    } catch (e) {
      const msg = e && e.message ? e.message : String(e || '');
      if (!/permission|insufficient/i.test(msg)) throw e;
      console.warn('Lettura appSettings/system non consentita; provo comunque il bootstrap create-only.', e);
    }

    const uid = win.currentUser.uid;
    const email = lower(win.currentUser.email || '');
    if (!email) throw new Error('L’account corrente non ha email verificabile.');
    const payload = {
      appName: 'Gestionale Cloud - Professionisti',
      version: VERSION,
      schemaVersion: 'superadmin-0.7.7',
      status: 'active',
      superadminUid: uid,
      superadminEmail: email,
      superadminEmails: [email],
      createdAt: nowIso(),
      createdBy: uid,
      updatedAt: nowIso(),
      notes: 'Bootstrap didattico: il primo amministratore applicativo è stato inizializzato da front-end.'
    };
    if (options && options.displayName) payload.superadminDisplayName = String(options.displayName).trim();

    try {
      await systemRef().set(payload, { merge: false });
    } catch (e) {
      const msg = e && e.message ? e.message : String(e || '');
      if (/permission|insufficient/i.test(msg)) {
        throw new Error('Bootstrap negato da Firestore. Pubblica le regole firestore.rules incluse nel pacchetto, oppure crea manualmente appSettings/system in Firebase Console con superadminUid e superadminEmails dell’utente corrente. Dettaglio: ' + msg);
      }
      throw e;
    }

    try {
      await writeUserProfile({ role: 'superadmin', status: 'active', source: 'bootstrap' });
    } catch (e) {
      console.warn('Profilo userProfiles non aggiornato dopo bootstrap superadmin.', e);
    }
    return payload;
  }

  async function writeUserProfile(extra) {
    if (!win.currentUser) throw new Error('Utente non autenticato.');
    const uid = win.currentUser.uid;
    const profile = {
      uid,
      email: lower(win.currentUser.email || ''),
      displayName: win.currentUser.displayName || '',
      updatedAt: nowIso(),
      version: VERSION,
      ...(extra || {})
    };
    await db.collection('userProfiles').doc(uid).set(profile, { merge: true });
    return profile;
  }

  async function buildSnapshot() {
    const warnings = [];
    let state = { exists: false, data: null };
    let memberships = [];

    try {
      state = await readSystemSettings();
    } catch (e) {
      warnings.push('Impossibile leggere appSettings/system: ' + (e && e.message ? e.message : e));
    }

    try {
      memberships = (win.BusinessGroupsService && typeof win.BusinessGroupsService.listMemberships === 'function')
        ? await win.BusinessGroupsService.listMemberships()
        : [];
    } catch (e) {
      warnings.push('Impossibile leggere le membership dell\'utente corrente: ' + (e && e.message ? e.message : e));
    }

    return {
      version: VERSION,
      generatedAt: nowIso(),
      user: win.currentUser ? { uid: win.currentUser.uid, email: win.currentUser.email || '', displayName: win.currentUser.displayName || '' } : null,
      systemExists: !!state.exists,
      system: state.data || null,
      isSuperadmin: state.exists ? isUserSuperadmin(state.data, win.currentUser) : false,
      memberships,
      warnings
    };
  }

  win.SuperadminService = {
    VERSION,
    readSystemSettings,
    claimFirstSuperadmin,
    writeUserProfile,
    isUserSuperadmin,
    isCurrentUserSuperadmin,
    buildSnapshot
  };
})();
