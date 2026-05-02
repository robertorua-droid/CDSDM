// firebase-cloud.js
// Inizializzazione Firebase + accesso diretto Firebase Auth/Firestore (nessun backend custom richiesto)

function initFirebase() {

    if (typeof firebase === 'undefined') {
        alert("ERRORE CRITICO: Firebase non caricato. Controlla la connessione internet.");
        return false;
    }

    try {
        const firebaseConfig = {
            apiKey: "AIzaSyBooZ43fEF3F93GOUTTsnDrGif5yZhzPjM",
            authDomain: "cdsdm-b6e8b.firebaseapp.com",
            projectId: "cdsdm-b6e8b",
            storageBucket: "cdsdm-b6e8b.firebasestorage.app",
            messagingSenderId: "267215157900",
            appId: "1:267215157900:web:e5356f86510bb29fc959a9"
        };

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        auth = firebase.auth();
        console.log("Firebase connesso.");
        return true;

    } catch (error) {
        console.error("Firebase Error:", error);
        alert("Errore connessione Database: " + error.message);
        return false;
    }

    // =========================================================
}


// 2. GESTIONE DATI CLOUD (legacy utente + Gruppi aziendali 0.6.0)
// =========================================================

async function loadAllDataFromCloud() {
    if (!currentUser) {
        console.warn("loadAllDataFromCloud chiamato senza utente.");
        return;
    }

    try {
        if (window.BusinessGroupsService && typeof window.BusinessGroupsService.ensureStateReady === 'function') {
            await window.BusinessGroupsService.ensureStateReady();
        }
        const dataRootRef = getDataRootRef();

        // 1) settings/companyInfo
        const companyDoc = await dataRootRef.collection('settings').doc('companyInfo').get();
        if (companyDoc.exists) {
            globalData.companyInfo = companyDoc.data();
            if (window.AppStore) window.AppStore.set('companyInfo', globalData.companyInfo, { silent: true });
        } else {
            globalData.companyInfo = {};
            if (window.AppStore) window.AppStore.set('companyInfo', globalData.companyInfo, { silent: true });
        }

        // 2) Altre collezioni: products, customers, invoices, notes
        const collections = window.CDSDM_DATA_COLLECTIONS || ['products', 'customers', 'suppliers', 'purchases', 'invoices', 'notes', 'commesse', 'projects', 'worklogs', 'vatRates', 'paymentMethods', 'companyBanks', 'warehouseMovements', 'quotes', 'customerOrders', 'supplierOrders', 'supplierDDTs', 'customerDDTs', 'warehousePhysicalCounts', 'warehouseLots', 'paymentEvents', 'cashbookMovements', 'reminderEvents', 'bankReconciliationEvents', 'businessBudgets', 'workflowEvents', 'auditEvents', 'teachingScenarios', 'simulationEvents', 'migrationReports', 'permissionProfiles', 'permissionMatrices', 'securityAccessReports'];
        for (const col of collections) {
            const snapshot = await dataRootRef.collection(col).get();
            globalData[col] = snapshot.docs.map(doc => ({
                id: String(doc.id),
                ...doc.data()
            }));
            if (window.AppStore) window.AppStore.set(col, globalData[col], { silent: true });
        }

        console.log("Dati sincronizzati:", window.currentBusinessGroup ? ('Gruppo aziendale ' + window.currentBusinessGroup.id) : ('Utente legacy ' + currentUser.uid), globalData);
        if (window.BusinessGroupsService && typeof window.BusinessGroupsService.updateSidebarBadge === 'function') window.BusinessGroupsService.updateSidebarBadge();
    } catch (e) {
        console.error("Errore Load Cloud:", e);
        throw e;
    }
}

async function saveDataToCloud(collection, dataObj, id = null) {
    if (!currentUser) {
        alert("Utente non autenticato.");
        return;
    }
    try {
        const dataRootRef = getDataRootRef();
        const scopedData = { ...(dataObj || {}) };
        if (window.currentBusinessGroup && window.currentBusinessGroup.id && collection !== 'companyInfo') {
            scopedData.businessGroupId = window.currentBusinessGroup.id;
        }

        if (collection === 'companyInfo') {
            if (window.currentBusinessGroup && window.currentBusinessGroup.id) scopedData.businessGroupId = window.currentBusinessGroup.id;
            const result = (window.ConcurrencyService && window.db)
                ? await window.ConcurrencyService.safeSet(dataRootRef, 'companyInfo', 'companyInfo', scopedData, {})
                : await dataRootRef.collection('settings').doc('companyInfo').set(scopedData, { merge: true });
            const savedData = result && result.data ? result.data : scopedData;
            globalData.companyInfo = { ...(globalData.companyInfo || {}), ...savedData };
            if (window.AppStore) window.AppStore.set('companyInfo', globalData.companyInfo);
        } else {
            if (!id) {
                console.error("ID mancante per salvataggio in", collection);
                return;
            }
            const strId = String(id);
            const result = (window.ConcurrencyService && window.db)
                ? await window.ConcurrencyService.safeSet(dataRootRef, collection, strId, scopedData, {})
                : await dataRootRef.collection(collection).doc(strId).set(scopedData, { merge: true });
            const savedData = result && result.data ? result.data : scopedData;

            if (!globalData[collection]) globalData[collection] = [];
            const index = globalData[collection].findIndex(item => String(item.id) === strId);
            if (index > -1) {
                globalData[collection][index] = { ...globalData[collection][index], ...savedData };
            } else {
                globalData[collection].push({ id: strId, ...savedData });
            }
            if (window.AppStore) window.AppStore.mergeItem(collection, strId, savedData, { silent: true });
            if (window.AppStore) window.AppStore.notify(collection);
        }
    } catch (e) {
        console.error("Errore Cloud:", e);
        alert("Errore Cloud: " + e.message);
    }
}

// Salvataggio batch (utile per aggiornamenti multipli come worklog -> fattura)
// updates: [{ id: '1', data: { ... } }, ...]
async function batchSaveDataToCloud(collection, updates) {
    if (!currentUser) {
        alert('Utente non autenticato.');
        return;
    }
    if (!collection) return;
    const list = Array.isArray(updates) ? updates : [];
    if (!list.length) return;

    try {
        const dataRootRef = getDataRootRef();
        const prepared = list.map(u => {
            if (!u || u.id == null) return null;
            const strId = String(u.id);
            const dataObj = { ...(u.data || {}) };
            if (window.currentBusinessGroup && window.currentBusinessGroup.id) dataObj.businessGroupId = window.currentBusinessGroup.id;
            return { id: strId, data: dataObj, expectedDocVersion: u.expectedDocVersion };
        }).filter(Boolean);

        let results = [];
        if (window.ConcurrencyService && window.db) {
            results = await window.ConcurrencyService.safeBatchSet(dataRootRef, collection, prepared, {});
        } else {
            const batch = db.batch();
            prepared.forEach(u => {
                const docRef = dataRootRef.collection(collection).doc(u.id);
                batch.set(docRef, u.data, { merge: true });
                results.push({ id: u.id, data: u.data });
            });
            await batch.commit();
        }

        results.forEach(r => {
            const strId = String(r.id);
            const dataObj = r.data || {};
            if (!globalData[collection]) globalData[collection] = [];
            const idx = globalData[collection].findIndex(it => String(it.id) === strId);
            if (idx > -1) {
                globalData[collection][idx] = { ...globalData[collection][idx], ...dataObj };
            } else {
                globalData[collection].push({ id: strId, ...dataObj });
            }
            if (window.AppStore) window.AppStore.mergeItem(collection, strId, dataObj, { silent: true });
        });
    } catch (e) {
        console.error('Errore batch Cloud:', e);
        alert('Errore batch Cloud: ' + e.message);
    }
}


async function deleteDataFromCloud(collection, id, options = {}) {
    if (!currentUser) {
        alert("Utente non autenticato.");
        return;
    }

    if (!confirm("Sei sicuro di voler eliminare questo elemento?")) return;

    try {
        const dataRootRef = getDataRootRef();
        const strId = String(id);
        if (window.ConcurrencyService && window.db) {
            const current = (globalData[collection] || []).find(item => String(item.id) === strId) || {};
            await window.ConcurrencyService.safeDelete(dataRootRef, collection, strId, { expectedDocVersion: current.docVersion });
        } else {
            await dataRootRef.collection(collection).doc(strId).delete();
        }

        if (globalData[collection]) {
            globalData[collection] = globalData[collection].filter(item => String(item.id) !== strId);
        }
        if (window.AppStore) window.AppStore.removeItem(collection, strId, { silent: true });
        if (window.AppStore) window.AppStore.notify(collection);
        if (!options.skipRender) renderAll();
    } catch (e) {
        console.error("Errore eliminazione:", e);
        alert("Errore eliminazione: " + e.message);
    }
}

// =========================================================

window.initFirebase = initFirebase;
window.batchSaveDataToCloud = batchSaveDataToCloud;

window.loadAllDataFromCloud = loadAllDataFromCloud;
window.saveDataToCloud = saveDataToCloud;
window.deleteDataFromCloud = deleteDataFromCloud;
