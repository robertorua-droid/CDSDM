// js/features/import/import-csv-module.js
// Import massivi CSV 0.2.5: anteprima, validazione e salvataggio batch su Firestore.

(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.importCsv = window.AppModules.importCsv || {};

  let _bound = false;
  let currentRows = [];
  let currentHeaders = [];
  let currentPrepared = [];

  const TARGETS = {
    customers: {
      label: 'Clienti',
      collection: 'customers',
      requiredAny: ['name', 'ragioneSociale', 'nome'],
      normalizer: function (row) {
        const raw = {
          id: pick(row, ['id', 'ID', 'codice']),
          name: pick(row, ['name', 'ragioneSociale', 'denominazione', 'cliente', 'nome']),
          ragioneSociale: pick(row, ['ragioneSociale', 'denominazione', 'name', 'cliente', 'nome']),
          piva: pick(row, ['piva', 'partitaIva', 'partita_iva', 'vatNumber']),
          codiceFiscale: pick(row, ['codiceFiscale', 'codice_fiscale', 'cf', 'taxCode']),
          address: pick(row, ['address', 'indirizzo', 'via']),
          cap: pick(row, ['cap', 'zip', 'postalCode']),
          comune: pick(row, ['comune', 'city', 'citta']),
          provincia: pick(row, ['provincia', 'province', 'siglaProvincia']),
          nazione: pick(row, ['nazione', 'country'], 'IT'),
          email: pick(row, ['email', 'mail']),
          pec: pick(row, ['pec']),
          sdi: pick(row, ['sdi', 'codiceDestinatario', 'codice_sdi']),
          phone: pick(row, ['phone', 'telefono', 'tel'])
        };
        return window.DomainNormalizers && window.DomainNormalizers.normalizeCustomerInfo ? window.DomainNormalizers.normalizeCustomerInfo(raw) : raw;
      }
    },
    suppliers: {
      label: 'Fornitori',
      collection: 'suppliers',
      requiredAny: ['name', 'ragioneSociale', 'fornitore', 'nome'],
      normalizer: function (row) {
        return {
          id: pick(row, ['id', 'ID', 'codice']),
          name: pick(row, ['name', 'ragioneSociale', 'denominazione', 'fornitore', 'nome']),
          ragioneSociale: pick(row, ['ragioneSociale', 'denominazione', 'name', 'fornitore', 'nome']),
          piva: pick(row, ['piva', 'partitaIva', 'partita_iva', 'vatNumber']),
          codiceFiscale: pick(row, ['codiceFiscale', 'codice_fiscale', 'cf', 'taxCode']),
          address: pick(row, ['address', 'indirizzo', 'via']),
          cap: pick(row, ['cap', 'zip', 'postalCode']),
          comune: pick(row, ['comune', 'city', 'citta']),
          provincia: pick(row, ['provincia', 'province', 'siglaProvincia']),
          nazione: pick(row, ['nazione', 'country'], 'IT'),
          email: pick(row, ['email', 'mail']),
          pec: pick(row, ['pec']),
          phone: pick(row, ['phone', 'telefono', 'tel']),
          notes: pick(row, ['notes', 'note'])
        };
      }
    },
    products: {
      label: 'Servizi / prodotti / costi',
      collection: 'products',
      requiredAny: ['description', 'descrizione', 'name', 'codice', 'code'],
      normalizer: function (row) {
        const raw = {
          id: pick(row, ['id', 'ID', 'codiceInterno']),
          description: pick(row, ['description', 'descrizione', 'name', 'prodotto', 'servizio']),
          code: pick(row, ['code', 'codice', 'sku']),
          itemType: normalizeItemType(pick(row, ['itemType', 'tipoVoce', 'tipo', 'type'], 'service')),
          purchasePrice: parseNumber(pick(row, ['purchasePrice', 'prezzoAcquisto', 'costoUnitario', 'unitCost'])),
          salePrice: parseNumber(pick(row, ['salePrice', 'prezzoVendita', 'prezzoUnitario', 'unitPrice', 'prezzo'])),
          vatRateId: pick(row, ['vatRateId', 'codiceIva', 'ivaId']),
          iva: pick(row, ['iva', 'aliquotaIva'], '22'),
          esenzioneIva: pick(row, ['esenzioneIva', 'natura', 'natureCode']),
          unitOfMeasure: pick(row, ['unitOfMeasure', 'um', 'unitaMisura'], 'pz'),
          stockQty: parseNumber(pick(row, ['stockQty', 'giacenza', 'giacenzaDisponibile', 'qty'])),
          reservedQty: parseNumber(pick(row, ['reservedQty', 'giacenzaRiservata'])),
          quarantineQty: parseNumber(pick(row, ['quarantineQty', 'giacenzaQuarantena', 'quarantena'])),
          minStockQty: parseNumber(pick(row, ['minStockQty', 'scortaMinima', 'minimumStock'])),
          warehouseLocation: pick(row, ['warehouseLocation', 'ubicazioneMagazzino', 'location']),
          trackingMode: normalizeTrackingMode(pick(row, ['trackingMode', 'tracciabilita', 'tracking'], 'none')),
          shelfLifeDays: parseNumber(pick(row, ['shelfLifeDays', 'durataGiorni']))
        };
        return window.DomainNormalizers && window.DomainNormalizers.normalizeProductInfo ? window.DomainNormalizers.normalizeProductInfo(raw) : raw;
      }
    },
    warehouseLots: {
      label: 'Lotti / matricole / scadenze',
      collection: 'warehouseLots',
      requiredAny: ['productId', 'prodottoId', 'lotCode', 'lotto', 'serialNumber', 'matricola'],
      normalizer: function (row) {
        const raw = {
          id: pick(row, ['id', 'ID']),
          productId: pick(row, ['productId', 'prodottoId', 'itemId']),
          lotCode: pick(row, ['lotCode', 'lotto', 'batchCode']),
          serialNumber: pick(row, ['serialNumber', 'matricola', 'seriale']),
          expiryDate: normalizeDate(pick(row, ['expiryDate', 'scadenza', 'dataScadenza'])),
          qtyAvailable: parseNumber(pick(row, ['qtyAvailable', 'disponibile', 'qty', 'quantita'])),
          qtyQuarantine: parseNumber(pick(row, ['qtyQuarantine', 'quarantena'])),
          supplierId: pick(row, ['supplierId', 'fornitoreId']),
          sourceDocumentNumber: pick(row, ['sourceDocumentNumber', 'documento', 'numeroDocumento']),
          status: pick(row, ['status', 'stato'], 'active'),
          notes: pick(row, ['notes', 'note'])
        };
        return window.DomainNormalizers && window.DomainNormalizers.normalizeWarehouseLot ? window.DomainNormalizers.normalizeWarehouseLot(raw) : raw;
      }
    },
    warehouseMovements: {
      label: 'Movimenti magazzino',
      collection: 'warehouseMovements',
      requiredAny: ['productId', 'prodottoId', 'quantity', 'qty', 'quantita'],
      normalizer: function (row) {
        const raw = {
          id: pick(row, ['id', 'ID']),
          productId: pick(row, ['productId', 'prodottoId', 'itemId']),
          productCode: pick(row, ['productCode', 'codiceProdotto', 'code']),
          productDescription: pick(row, ['productDescription', 'descrizioneProdotto', 'description']),
          movementType: normalizeMovementType(pick(row, ['movementType', 'tipoMovimento', 'type'], 'CARICO')),
          quantity: parseNumber(pick(row, ['quantity', 'qty', 'quantita'])),
          date: normalizeDate(pick(row, ['date', 'data'], todayISO())),
          causale: pick(row, ['causale', 'reason'], 'Import CSV'),
          notes: pick(row, ['notes', 'note'])
        };
        return window.DomainNormalizers && window.DomainNormalizers.normalizeWarehouseMovement ? window.DomainNormalizers.normalizeWarehouseMovement(raw) : raw;
      }
    }
  };

  function bind() {
    if (_bound) return;
    _bound = true;

    $('#mass-import-target').off('change.importCsv').on('change.importCsv', resetPreview);
    $('#mass-import-file').off('change.importCsv').on('change.importCsv', handleFileChange);
    $('#mass-import-preview-btn').off('click.importCsv').on('click.importCsv', preparePreviewFromFile);
    $('#mass-import-confirm-btn').off('click.importCsv').on('click.importCsv', confirmImport);
    $('#mass-import-template-btn').off('click.importCsv').on('click.importCsv', downloadTemplate);
  }

  function render() {
    resetPreview();
  }

  function handleFileChange() {
    resetPreview(false);
  }

  function preparePreviewFromFile() {
    const file = ($('#mass-import-file')[0] && $('#mass-import-file')[0].files && $('#mass-import-file')[0].files[0]) || null;
    const targetKey = $('#mass-import-target').val();
    if (!file) { setStatus('Seleziona un file CSV prima di generare l’anteprima.', 'warning'); return; }
    if (!TARGETS[targetKey]) { setStatus('Seleziona un tipo di import valido.', 'warning'); return; }

    const name = String(file.name || '').toLowerCase();
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      setStatus('I file Excel vanno salvati come CSV UTF-8 prima dell’import. In questa release l’import resta 100% browser e non usa librerie esterne.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const text = String(ev.target.result || '');
        const parsed = parseCsv(text);
        currentHeaders = parsed.headers;
        currentRows = parsed.rows;
        currentPrepared = prepareRows(targetKey, currentRows);
        renderPreview(targetKey, currentPrepared);
      } catch (e) {
        console.error(e);
        setStatus('Errore lettura CSV: ' + e.message, 'danger');
      }
    };
    reader.onerror = function () { setStatus('Impossibile leggere il file selezionato.', 'danger'); };
    reader.readAsText(file, 'UTF-8');
  }

  function prepareRows(targetKey, rows) {
    const cfg = TARGETS[targetKey];
    const existing = getCollection(cfg.collection);
    const usedIds = new Set(existing.map(function (x) { return String(x.id); }));
    let next = getNextNumericId(existing);
    return rows.map(function (row, index) {
      const errors = [];
      const hasRequired = cfg.requiredAny.some(function (h) { return !!String(pick(row, [h]) || '').trim(); });
      if (!hasRequired) errors.push('manca campo minimo richiesto');

      let data = cfg.normalizer(row);
      let id = String(data.id || pick(row, ['id', 'ID']) || '').trim();
      if (!id) {
        while (usedIds.has(String(next))) next += 1;
        id = String(next++);
      }
      usedIds.add(id);
      data.id = id;
      data.updatedAt = data.updatedAt || new Date().toISOString();
      if (!data.createdAt) data.createdAt = new Date().toISOString();

      validateDomain(targetKey, data, errors);
      return { index: index + 1, raw: row, id: id, data: data, errors: errors, valid: errors.length === 0 };
    });
  }

  function validateDomain(targetKey, data, errors) {
    if (targetKey === 'products') {
      if (!data.description && !data.name) errors.push('descrizione prodotto/servizio mancante');
      if (data.itemType === 'product' && data.stockQty < 0) errors.push('giacenza negativa');
    }
    if (targetKey === 'warehouseLots') {
      if (!data.productId) errors.push('productId mancante');
      if (!data.lotCode && !data.serialNumber) errors.push('lotto o matricola obbligatori');
      if ((data.qtyAvailable || 0) < 0 || (data.qtyQuarantine || 0) < 0) errors.push('quantità negativa');
    }
    if (targetKey === 'warehouseMovements') {
      if (!data.productId) errors.push('productId mancante');
      if (!data.quantity || data.quantity <= 0) errors.push('quantità obbligatoria e positiva');
    }
  }

  function renderPreview(targetKey, prepared) {
    const valid = prepared.filter(function (r) { return r.valid; }).length;
    const invalid = prepared.length - valid;
    $('#mass-import-total').text(prepared.length);
    $('#mass-import-valid').text(valid);
    $('#mass-import-invalid').text(invalid);
    $('#mass-import-confirm-btn').prop('disabled', valid === 0 || invalid > 0);

    if (!prepared.length) {
      $('#mass-import-preview').html('<div class="alert alert-warning mb-0">Il CSV non contiene righe dati.</div>');
      setStatus('Nessuna riga importabile trovata.', 'warning');
      return;
    }

    const cols = guessPreviewColumns(targetKey);
    const rowsHtml = prepared.slice(0, 50).map(function (p) {
      return '<tr class="' + (p.valid ? '' : 'table-danger') + '">' +
        '<td>' + p.index + '</td>' +
        '<td><code>' + escapeHtml(p.id) + '</code></td>' +
        cols.map(function (c) { return '<td>' + escapeHtml(readPath(p.data, c.key)) + '</td>'; }).join('') +
        '<td>' + (p.valid ? '<span class="badge text-bg-success">OK</span>' : '<span class="badge text-bg-danger">Errore</span> ' + escapeHtml(p.errors.join('; '))) + '</td>' +
      '</tr>';
    }).join('');

    $('#mass-import-preview').html(
      '<div class="table-responsive"><table class="table table-sm table-striped align-middle mb-0">' +
      '<thead><tr><th>#</th><th>ID</th>' + cols.map(function (c) { return '<th>' + escapeHtml(c.label) + '</th>'; }).join('') + '<th>Esito</th></tr></thead>' +
      '<tbody>' + rowsHtml + '</tbody></table></div>' +
      (prepared.length > 50 ? '<div class="small text-muted mt-2">Anteprima limitata alle prime 50 righe.</div>' : '')
    );
    setStatus(invalid ? 'Correggi le righe in errore prima di importare.' : 'Anteprima pronta: ' + valid + ' righe valide.', invalid ? 'warning' : 'success');
  }

  async function confirmImport() {
    const targetKey = $('#mass-import-target').val();
    const cfg = TARGETS[targetKey];
    if (!cfg) return;
    const validRows = currentPrepared.filter(function (r) { return r.valid; });
    const invalid = currentPrepared.length - validRows.length;
    if (!validRows.length || invalid > 0) { setStatus('Import bloccato: sono presenti righe non valide.', 'warning'); return; }
    if (!confirm('Importare ' + validRows.length + ' righe in ' + cfg.label + '? Gli ID già esistenti verranno aggiornati.')) return;

    try {
      $('#mass-import-confirm-btn').prop('disabled', true);
      const updates = validRows.map(function (r) { return { id: r.id, data: r.data }; });
      if (typeof window.batchSaveDataToCloud === 'function') await window.batchSaveDataToCloud(cfg.collection, updates);
      else {
        for (const u of updates) await window.saveDataToCloud(cfg.collection, u.data, u.id);
      }
      if (typeof renderAll === 'function') renderAll();
      setStatus('Import completato: ' + validRows.length + ' righe salvate in ' + cfg.label + '.', 'success');
    } catch (e) {
      console.error(e);
      setStatus('Errore durante il salvataggio: ' + e.message, 'danger');
      $('#mass-import-confirm-btn').prop('disabled', false);
    }
  }

  function downloadTemplate() {
    const targetKey = $('#mass-import-target').val();
    const templates = {
      customers: 'id;name;piva;codiceFiscale;address;cap;comune;provincia;nazione;email;pec;sdi\n;Mario Rossi;;RSSMRA80A01H501U;Via Roma 1;00100;Roma;RM;IT;mario@example.com;;\n',
      suppliers: 'id;name;piva;codiceFiscale;address;cap;comune;provincia;nazione;email;pec;phone\n;Fornitore Demo;01234567890;;Via Milano 2;20100;Milano;MI;IT;info@fornitore.test;;\n',
      products: 'id;code;description;itemType;purchasePrice;salePrice;iva;unitOfMeasure;stockQty;quarantineQty;reservedQty;minStockQty;warehouseLocation;trackingMode\n;P001;Prodotto Demo;product;10,50;18,00;22;pz;25;0;0;5;A1;none\n',
      warehouseLots: 'id;productId;lotCode;serialNumber;expiryDate;qtyAvailable;qtyQuarantine;supplierId;sourceDocumentNumber;status;notes\n;1;LOT-001;;2026-12-31;10;0;;DDT-1;active;\n',
      warehouseMovements: 'id;productId;productCode;productDescription;movementType;quantity;date;causale;notes\n;1;P001;P001;Prodotto Demo;CARICO;10;' + todayISO() + ';Giacenza iniziale;\n'
    };
    const csv = templates[targetKey] || templates.customers;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_' + targetKey + '_CDSDM_0.2.5.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function parseCsv(text) {
    const clean = String(text || '').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const delimiter = detectDelimiter(clean);
    const matrix = [];
    let row = [], field = '', inQuotes = false;
    for (let i = 0; i < clean.length; i++) {
      const ch = clean[i];
      const next = clean[i + 1];
      if (ch === '"') {
        if (inQuotes && next === '"') { field += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === delimiter && !inQuotes) {
        row.push(field); field = '';
      } else if (ch === '\n' && !inQuotes) {
        row.push(field); field = '';
        if (row.some(function (c) { return String(c).trim() !== ''; })) matrix.push(row);
        row = [];
      } else field += ch;
    }
    row.push(field);
    if (row.some(function (c) { return String(c).trim() !== ''; })) matrix.push(row);
    if (!matrix.length) return { headers: [], rows: [] };
    const headers = matrix[0].map(function (h) { return String(h || '').trim(); });
    const rows = matrix.slice(1).map(function (cells) {
      const obj = {};
      headers.forEach(function (h, idx) { obj[h] = String(cells[idx] || '').trim(); });
      return obj;
    }).filter(function (obj) { return Object.values(obj).some(function (v) { return String(v).trim() !== ''; }); });
    return { headers: headers, rows: rows };
  }

  function detectDelimiter(text) {
    const first = String(text || '').split('\n')[0] || '';
    const semi = (first.match(/;/g) || []).length;
    const comma = (first.match(/,/g) || []).length;
    const tab = (first.match(/\t/g) || []).length;
    if (tab > semi && tab > comma) return '\t';
    return semi >= comma ? ';' : ',';
  }

  function pick(row, names, fallback) {
    const lowerMap = {};
    Object.keys(row || {}).forEach(function (k) { lowerMap[String(k).toLowerCase().trim()] = row[k]; });
    for (let i = 0; i < names.length; i++) {
      const key = String(names[i]).toLowerCase().trim();
      if (lowerMap[key] !== undefined && String(lowerMap[key]).trim() !== '') return lowerMap[key];
    }
    return fallback !== undefined ? fallback : '';
  }
  function parseNumber(v) { const n = parseFloat(String(v || '').replace(',', '.')); return isNaN(n) ? 0 : n; }
  function normalizeDate(v) {
    const s = String(v || '').trim();
    if (!s) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) return m[3] + '-' + String(m[2]).padStart(2, '0') + '-' + String(m[1]).padStart(2, '0');
    return s;
  }
  function normalizeItemType(v) {
    const s = String(v || '').toLowerCase().trim();
    if (['product', 'prodotto', 'magazzino'].includes(s)) return 'product';
    if (['cost', 'costo'].includes(s)) return 'cost';
    return 'service';
  }
  function normalizeTrackingMode(v) {
    const s = String(v || '').toLowerCase().trim();
    if (['lot', 'lotto'].includes(s)) return 'lot';
    if (['serial', 'matricola'].includes(s)) return 'serial';
    if (['expiry', 'scadenza', 'lotto_scadenza'].includes(s)) return 'expiry';
    return 'none';
  }
  function normalizeMovementType(v) {
    const s = String(v || '').toUpperCase().trim();
    return ['CARICO', 'SCARICO', 'RETTIFICA', 'QUARANTENA_IN', 'QUARANTENA_OUT', 'SCARTO', 'RESO_FORNITORE'].includes(s) ? s : 'CARICO';
  }
  function getCollection(name) { return (typeof window.getData === 'function' ? window.getData(name) : (window.globalData && window.globalData[name])) || []; }
  function getNextNumericId(items) {
    const nums = (items || []).map(function (x) { return parseInt(x.id, 10); }).filter(function (n) { return !isNaN(n); });
    return nums.length ? Math.max.apply(null, nums) + 1 : 1;
  }
  function guessPreviewColumns(targetKey) {
    if (targetKey === 'customers' || targetKey === 'suppliers') return [{ key: 'name', label: 'Nome' }, { key: 'piva', label: 'P.IVA' }, { key: 'email', label: 'Email' }];
    if (targetKey === 'products') return [{ key: 'code', label: 'Codice' }, { key: 'description', label: 'Descrizione' }, { key: 'itemType', label: 'Tipo' }, { key: 'stockQty', label: 'Giacenza' }];
    if (targetKey === 'warehouseLots') return [{ key: 'productId', label: 'Prodotto' }, { key: 'lotCode', label: 'Lotto' }, { key: 'serialNumber', label: 'Matricola' }, { key: 'expiryDate', label: 'Scadenza' }];
    return [{ key: 'productId', label: 'Prodotto' }, { key: 'movementType', label: 'Tipo' }, { key: 'quantity', label: 'Quantità' }, { key: 'date', label: 'Data' }];
  }
  function readPath(obj, key) { return obj && obj[key] !== undefined ? obj[key] : ''; }
  function escapeHtml(v) { return String(v == null ? '' : v).replace(/[&<>'"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]; }); }
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function resetPreview(clearFile) {
    currentRows = []; currentHeaders = []; currentPrepared = [];
    $('#mass-import-total,#mass-import-valid,#mass-import-invalid').text('0');
    $('#mass-import-confirm-btn').prop('disabled', true);
    $('#mass-import-preview').html('<div class="alert alert-light border mb-0">Carica un CSV e genera l’anteprima. Nessun dato viene salvato prima della conferma.</div>');
    if (clearFile !== false) $('#mass-import-file').val('');
    setStatus('Pronto per import CSV.', 'secondary');
  }
  function setStatus(message, type) {
    $('#mass-import-status').html('<div class="alert alert-' + (type || 'secondary') + ' mb-0">' + escapeHtml(message) + '</div>');
  }

  window.AppModules.importCsv.bind = bind;
  window.AppModules.importCsv.render = render;
  window.AppModules.importCsv.parseCsv = parseCsv;
  window.AppModules.importCsv.prepareRows = prepareRows;
})();
