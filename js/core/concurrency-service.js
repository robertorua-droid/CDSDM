// js/core/concurrency-service.js
// CDSDM 0.5.4 — Controllo concorrenza e scritture sicure
// Servizio front-end per versionamento ottimistico, metadata autore, transazioni Firestore,
// lock leggero con scadenza, idempotenza opzionale e audit conflitti.

(function () {
  const win = window;
  const VERSION = '0.5.4';
  const DEFAULT_LOCK_TTL_MS = 2 * 60 * 1000;

  function nowIso() { return new Date().toISOString(); }
  function str(v) { return String(v == null ? '' : v).trim(); }
  function uid() { return win.currentUser && win.currentUser.uid ? win.currentUser.uid : ''; }
  function email() { return win.currentUser && win.currentUser.email ? win.currentUser.email : ''; }
  function isGroupMode() { return !!(win.currentBusinessGroup && win.currentBusinessGroup.id); }
  function groupId() { return isGroupMode() ? win.currentBusinessGroup.id : ''; }
  function currentDocVersion(raw) {
    const n = Number(raw && raw.docVersion);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }
  function expectedFromData(data, options) {
    if (options && options.expectedDocVersion != null) return Number(options.expectedDocVersion);
    if (data && data._expectedDocVersion != null) return Number(data._expectedDocVersion);
    if (data && data.docVersion != null) return Number(data.docVersion);
    return null;
  }
  function cleanData(data) {
    const out = { ...(data || {}) };
    delete out._expectedDocVersion;
    delete out._lockToken;
    delete out._idempotencyKey;
    return out;
  }
  function addWriteMetadata(data, current, options) {
    const base = cleanData(data);
    const nextDocVersion = currentDocVersion(current) + 1;
    const at = nowIso();
    base.updatedAt = base.updatedAt || at;
    base.updatedBy = base.updatedBy || uid();
    base.docVersion = nextDocVersion;
    base.writePolicyVersion = VERSION;
    if (!current || !current.createdAt) base.createdAt = base.createdAt || at;
    if (!current || !current.createdBy) base.createdBy = base.createdBy || uid();
    if (isGroupMode()) base.businessGroupId = groupId();
    const idempotencyKey = (options && options.idempotencyKey) || (data && data._idempotencyKey);
    if (idempotencyKey) {
      base.lastIdempotencyKey = str(idempotencyKey);
      base.lastIdempotencyAt = at;
    }
    return base;
  }
  function isSameIdempotency(current, data, options) {
    const key = str((options && options.idempotencyKey) || (data && data._idempotencyKey));
    return !!(key && current && str(current.lastIdempotencyKey) === key);
  }
  function makeConflict(collection, id, expected, actual) {
    const err = new Error('Conflitto di modifica: il documento ' + collection + '/' + id + ' è stato aggiornato da un altro utente. Ricarica i dati e ripeti l’operazione.');
    err.code = 'CDSDM_DOC_VERSION_CONFLICT';
    err.collection = collection;
    err.documentId = id;
    err.expectedDocVersion = expected;
    err.actualDocVersion = actual;
    return err;
  }
  function docRef(rootRef, collection, id) {
    if (!rootRef || !collection || id == null) throw new Error('Riferimento documento non valido.');
    if (collection === 'companyInfo') return rootRef.collection('settings').doc('companyInfo');
    return rootRef.collection(collection).doc(String(id));
  }
  function tsFromMs(ms) {
    if (win.firebase && win.firebase.firestore && win.firebase.firestore.Timestamp) {
      return win.firebase.firestore.Timestamp.fromDate(new Date(ms));
    }
    return new Date(ms);
  }
  async function auditConflict(payload) {
    try {
      if (!isGroupMode() || !win.db) return;
      const ref = win.db.collection('businessGroups').doc(groupId()).collection('auditEvents').doc();
      await ref.set({
        id: ref.id,
        type: 'concurrency',
        action: payload.action || 'write_conflict',
        area: 'Scritture sicure',
        actorUid: uid(),
        actorEmail: email(),
        date: nowIso().slice(0, 10),
        createdAt: nowIso(),
        details: payload,
        version: VERSION
      }, { merge: true });
    } catch (e) {
      console.warn('Audit conflitto non registrato:', e);
    }
  }

  async function safeSet(rootRef, collection, id, data, options = {}) {
    const ref = docRef(rootRef, collection, id || 'companyInfo');
    const expected = expectedFromData(data, options);
    try {
      return await win.db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      const current = snap.exists ? (snap.data() || {}) : null;
      if (isSameIdempotency(current, data, options)) {
        return { id: ref.id, skipped: true, data: current, docVersion: currentDocVersion(current) };
      }
      const actual = currentDocVersion(current);
      if (expected != null && Number.isFinite(expected) && expected !== actual) {
        const conflict = makeConflict(collection, ref.id, expected, actual);
        conflict.auditPayload = { action: 'write_conflict', collection, documentId: ref.id, expectedDocVersion: expected, actualDocVersion: actual };
        throw conflict;
      }
      const payload = addWriteMetadata(data, current, options);
      tx.set(ref, payload, { merge: options.merge !== false });
      return { id: ref.id, skipped: false, data: payload, docVersion: payload.docVersion };
      });
    } catch (e) {
      if (e && e.auditPayload) await auditConflict(e.auditPayload);
      throw e;
    }
  }

  async function safeBatchSet(rootRef, collection, updates, options = {}) {
    const rows = Array.isArray(updates) ? updates.filter(u => u && u.id != null) : [];
    if (!rows.length) return [];
    try {
      return await win.db.runTransaction(async tx => {
      const prepared = [];
      for (const u of rows) {
        const ref = docRef(rootRef, collection, u.id);
        const snap = await tx.get(ref);
        const current = snap.exists ? (snap.data() || {}) : null;
        if (isSameIdempotency(current, u.data, u)) {
          prepared.push({ id: ref.id, skipped: true, data: current, docVersion: currentDocVersion(current) });
          continue;
        }
        const expected = expectedFromData(u.data, u);
        const actual = currentDocVersion(current);
        if (expected != null && Number.isFinite(expected) && expected !== actual) {
          const conflict = makeConflict(collection, ref.id, expected, actual);
          conflict.auditPayload = { action: 'batch_write_conflict', collection, documentId: ref.id, expectedDocVersion: expected, actualDocVersion: actual };
          throw conflict;
        }
        const payload = addWriteMetadata(u.data, current, u);
        prepared.push({ ref, id: ref.id, skipped: false, data: payload, docVersion: payload.docVersion });
      }
      prepared.forEach(p => { if (!p.skipped) tx.set(p.ref, p.data, { merge: options.merge !== false }); });
      return prepared.map(p => ({ id: p.id, skipped: p.skipped, data: p.data, docVersion: p.docVersion }));
      });
    } catch (e) {
      if (e && e.auditPayload) await auditConflict(e.auditPayload);
      throw e;
    }
  }

  async function safeDelete(rootRef, collection, id, options = {}) {
    const ref = docRef(rootRef, collection, id);
    const expected = options.expectedDocVersion != null ? Number(options.expectedDocVersion) : null;
    try {
      return await win.db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      if (!snap.exists) return { id: ref.id, deleted: false, missing: true };
      const current = snap.data() || {};
      const actual = currentDocVersion(current);
      if (expected != null && Number.isFinite(expected) && expected !== actual) {
        const conflict = makeConflict(collection, ref.id, expected, actual);
        conflict.auditPayload = { action: 'delete_conflict', collection, documentId: ref.id, expectedDocVersion: expected, actualDocVersion: actual };
        throw conflict;
      }
      tx.delete(ref);
      return { id: ref.id, deleted: true, docVersion: actual };
      });
    } catch (e) {
      if (e && e.auditPayload) await auditConflict(e.auditPayload);
      throw e;
    }
  }

  function lockRef(rootRef, collection, id) {
    const safeId = encodeURIComponent(String(collection)) + '__' + encodeURIComponent(String(id));
    if (isGroupMode()) return win.db.collection('businessGroups').doc(groupId()).collection('documentLocks').doc(safeId);
    return rootRef.collection('documentLocks').doc(safeId);
  }

  async function acquireLock(rootRef, collection, id, options = {}) {
    if (!rootRef || !collection || id == null) throw new Error('Lock non valido.');
    const ref = lockRef(rootRef, collection, id);
    const ttlMs = Number(options.ttlMs || DEFAULT_LOCK_TTL_MS);
    const token = str(options.token) || (uid() + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8));
    const nowMs = Date.now();
    await win.db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      const data = snap.exists ? (snap.data() || {}) : null;
      const expires = data && data.expiresAt && typeof data.expiresAt.toMillis === 'function' ? data.expiresAt.toMillis() : 0;
      if (data && data.ownerUid && data.ownerUid !== uid() && expires > nowMs) {
        const err = new Error('Documento temporaneamente in modifica da un altro utente. Riprova dopo la scadenza del lock.');
        err.code = 'CDSDM_DOCUMENT_LOCKED';
        err.lock = data;
        throw err;
      }
      tx.set(ref, {
        id: ref.id,
        collection,
        documentId: String(id),
        ownerUid: uid(),
        ownerEmail: email(),
        token,
        createdAt: nowIso(),
        expiresAt: tsFromMs(nowMs + ttlMs),
        ttlMs,
        version: VERSION
      }, { merge: true });
    });
    return { token, expiresAt: new Date(nowMs + ttlMs).toISOString() };
  }

  async function releaseLock(rootRef, collection, id, token) {
    const ref = lockRef(rootRef, collection, id);
    await win.db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      if (!snap.exists) return;
      const data = snap.data() || {};
      if (data.ownerUid === uid() && (!token || data.token === token)) tx.delete(ref);
    });
    return true;
  }

  win.ConcurrencyService = {
    VERSION,
    DEFAULT_LOCK_TTL_MS,
    currentDocVersion,
    addWriteMetadata,
    safeSet,
    safeBatchSet,
    safeDelete,
    acquireLock,
    releaseLock,
    auditConflict
  };
})();
