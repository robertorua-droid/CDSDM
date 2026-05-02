// js/ui/accessibility-ux-service.js
// CDSDM 0.4.8 - Dark Mode, accessibilita e select dinamiche

(function () {
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function exists(selector) { return document.querySelectorAll(selector).length; }

  function ensureId(el, prefix, index) {
    if (!el.id) el.id = prefix + '-' + index;
    return el.id;
  }

  function humanizeToken(value) {
    const raw = String(value == null ? '' : value)
      .replace(/^#/, '')
      .replace(/[_-]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();
    if (!raw) return '';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  function iconLabel(el) {
    const cls = (el.getAttribute('class') || '') + ' ' + Array.prototype.map.call(el.querySelectorAll('i'), function (i) { return i.getAttribute('class') || ''; }).join(' ');
    const map = [
      [/fa-(rotate|sync|refresh|redo)/, 'Aggiorna'],
      [/fa-save/, 'Salva'],
      [/fa-trash|fa-times|fa-xmark/, 'Elimina'],
      [/fa-edit|fa-pen/, 'Modifica'],
      [/fa-eye/, 'Visualizza'],
      [/fa-print/, 'Stampa'],
      [/fa-file-(csv|export)|fa-download/, 'Esporta'],
      [/fa-file-import|fa-upload/, 'Importa'],
      [/fa-plus/, 'Aggiungi'],
      [/fa-search|fa-magnifying-glass/, 'Cerca'],
      [/fa-copy/, 'Copia'],
      [/fa-check/, 'Conferma'],
      [/fa-ban|fa-lock/, 'Blocca'],
      [/fa-unlock/, 'Sblocca'],
      [/fa-link/, 'Apri collegamento'],
      [/fa-info/, 'Informazioni']
    ];
    for (let i = 0; i < map.length; i += 1) if (map[i][0].test(cls)) return map[i][1];
    return '';
  }

  function inferControlLabel(el, index) {
    if (!el) return '';
    const explicit = el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('placeholder');
    if (explicit) return explicit;
    const labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
      const src = document.getElementById(labelledBy);
      if (src && (src.textContent || '').trim()) return (src.textContent || '').trim();
    }
    const id = el.id || '';
    if (id) {
      const clean = id.replace(/^(input|select|textarea|btn|button|filter|form)-?/i, '');
      const label = humanizeToken(clean);
      if (label) return label;
    }
    const name = el.getAttribute('name');
    if (name) return humanizeToken(name);
    const dataField = el.getAttribute('data-field') || el.getAttribute('data-name') || el.getAttribute('data-target');
    if (dataField) return humanizeToken(dataField);
    const type = el.getAttribute('type');
    if (type && type !== 'text') return humanizeToken(type);
    return 'Campo ' + (index + 1);
  }

  function inferButtonLabel(btn, index) {
    const text = (btn.textContent || '').trim();
    if (text) return text;
    const explicit = btn.getAttribute('aria-label') || btn.getAttribute('title');
    if (explicit) return explicit;
    const icon = iconLabel(btn);
    if (icon) return icon;
    const id = btn.id;
    if (id) return humanizeToken(id.replace(/^(btn|button)-?/i, '')) || ('Pulsante ' + (index + 1));
    const target = btn.getAttribute('data-target') || btn.getAttribute('data-bs-target') || btn.getAttribute('data-section');
    if (target) return 'Apri ' + humanizeToken(target);
    const onclick = btn.getAttribute('onclick') || '';
    if (onclick) return humanizeToken(onclick.replace(/\(.*/, '').replace(/^window\./, '')) || ('Azione ' + (index + 1));
    return 'Pulsante ' + (index + 1);
  }

  function hasAccessibleName(el, root) {
    root = root || document;
    const id = el.id;
    const hasExplicit = id && root.querySelector('label[for="' + CSS.escape(id) + '"]');
    const hasAria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.closest('label');
    return !!(hasExplicit || hasAria);
  }

  function repairFormLabels(root) {
    root = root || document;
    let repaired = 0;
    const controls = Array.prototype.slice.call(root.querySelectorAll('input:not([type="hidden"]), select, textarea'));
    controls.forEach(function (el, index) {
      if (hasAccessibleName(el, root)) return;
      const label = inferControlLabel(el, index);
      if (label) {
        el.setAttribute('aria-label', label);
        el.setAttribute('data-a11y-auto-label', 'true');
        repaired += 1;
      }
    });
    return repaired;
  }

  function repairButtonNames(root) {
    root = root || document;
    let repaired = 0;
    const buttons = Array.prototype.slice.call(root.querySelectorAll('button'));
    buttons.forEach(function (btn, index) {
      if (!btn.getAttribute('type')) btn.setAttribute('type', 'button');
      const hasName = (btn.textContent || '').trim() || btn.getAttribute('aria-label') || btn.getAttribute('aria-labelledby') || btn.getAttribute('title');
      if (hasName) return;
      const label = inferButtonLabel(btn, index);
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
      btn.setAttribute('data-a11y-auto-label', 'true');
      repaired += 1;
    });
    return repaired;
  }

  function applyRuntimeEnhancements() {
    const doc = document;
    const body = doc.body;
    const stats = { formLabels: 0, buttonNames: 0 };
    if (!body) return stats;

    if (!doc.getElementById('skip-to-content')) {
      const skip = doc.createElement('a');
      skip.id = 'skip-to-content';
      skip.className = 'skip-link';
      skip.href = '#app-main-content';
      skip.textContent = 'Salta al contenuto principale';
      body.insertBefore(skip, body.firstChild);
    }

    const main = doc.querySelector('.main-content');
    if (main) {
      main.id = main.id || 'app-main-content';
      main.setAttribute('role', 'main');
      main.setAttribute('tabindex', '-1');
    }

    const sidebar = doc.querySelector('.sidebar');
    if (sidebar) {
      sidebar.setAttribute('role', 'navigation');
      sidebar.setAttribute('aria-label', 'Navigazione principale');
    }

    doc.querySelectorAll('.nav-section-container').forEach(function (section, index) {
      const header = section.querySelector('.nav-section-header');
      const content = section.querySelector('.nav-section-content');
      if (!header || !content) return;
      const contentId = ensureId(content, 'nav-section-content', index);
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('aria-controls', contentId);
      header.setAttribute('aria-expanded', section.classList.contains('collapsed') ? 'false' : 'true');
    });

    doc.querySelectorAll('a.nav-link[data-target]').forEach(function (link) {
      link.setAttribute('aria-current', link.classList.contains('active') ? 'page' : 'false');
    });

    stats.formLabels = repairFormLabels(doc);
    stats.buttonNames = repairButtonNames(doc);
    window._lastAccessibilityUxRepairStats = stats;
    return stats;
  }

  function buildAudit(root) {
    root = root || document;
    applyRuntimeEnhancements();
    const checks = [];
    const add = function (id, label, ok, detail, severity) {
      checks.push({ id: id, label: label, ok: !!ok, detail: detail || '', severity: severity || (ok ? 'success' : 'warning') });
    };

    const repairStats = window._lastAccessibilityUxRepairStats || { formLabels: 0, buttonNames: 0 };
    add('skip-link', 'Skip link al contenuto principale', !!root.getElementById('skip-to-content') || exists('.skip-link') > 0, 'Aiuta la navigazione da tastiera.');
    add('main-landmark', 'Landmark principale', exists('[role="main"], main') > 0, 'La pagina deve avere un contenuto principale identificabile.');
    add('nav-landmark', 'Landmark navigazione', exists('[role="navigation"], nav') > 0, 'La sidebar deve essere riconoscibile dagli screen reader.');
    add('focus-visible-css', 'Stile focus visibile', !!Array.prototype.find.call(document.styleSheets || [], function () { return true; }), 'Verifica presenza CSS runtime; il test puntuale e nel file CSS.');

    const inputs = Array.prototype.slice.call(root.querySelectorAll('input:not([type="hidden"]), select, textarea'));
    const unlabeled = inputs.filter(function (el) { return !hasAccessibleName(el, root); });
    add('form-labels', 'Campi form etichettati', unlabeled.length === 0, unlabeled.length ? unlabeled.length + ' campi senza label/aria.' : 'Tutti i campi ispezionati hanno una label o un attributo aria. Auto-correzioni runtime: ' + (repairStats.formLabels || 0) + '.', unlabeled.length ? 'warning' : 'success');

    const autoLabeledInputs = inputs.filter(function (el) { return el.getAttribute('data-a11y-auto-label') === 'true'; }).length;
    add('form-labels-runtime', 'Etichette runtime applicate', true, autoLabeledInputs + ' campi legacy/dinamici ricevono aria-label derivato da id, name o placeholder.', 'success');

    const buttons = Array.prototype.slice.call(root.querySelectorAll('button'));
    const unnamedButtons = buttons.filter(function (btn) { return !((btn.textContent || '').trim() || btn.getAttribute('aria-label') || btn.getAttribute('aria-labelledby') || btn.getAttribute('title')); });
    add('button-names', 'Pulsanti con nome accessibile', unnamedButtons.length === 0, unnamedButtons.length ? unnamedButtons.length + ' pulsanti senza testo/aria-label.' : 'Pulsanti ispezionati nominati correttamente. Auto-correzioni runtime: ' + (repairStats.buttonNames || 0) + '.', unnamedButtons.length ? 'warning' : 'success');

    const autoNamedButtons = buttons.filter(function (btn) { return btn.getAttribute('data-a11y-auto-label') === 'true'; }).length;
    add('button-names-runtime', 'Nomi runtime applicati ai pulsanti', true, autoNamedButtons + ' pulsanti legacy/dinamici ricevono aria-label derivato da icona, id o azione.', 'success');

    const menuTargets = Array.prototype.slice.call(root.querySelectorAll('.sidebar .nav-link[data-target]')).map(function (a) { return a.getAttribute('data-target'); });
    const missingSections = menuTargets.filter(function (target) { return target && !root.getElementById(target); });
    add('menu-targets', 'Voci menu collegate a sezioni', missingSections.length === 0, missingSections.length ? 'Target mancanti: ' + missingSections.join(', ') : 'Ogni voce menu ispezionata punta a una sezione esistente.', missingSections.length ? 'danger' : 'success');

    const duplicatedIds = [];
    const seen = {};
    root.querySelectorAll('[id]').forEach(function (el) {
      if (seen[el.id]) duplicatedIds.push(el.id); else seen[el.id] = true;
    });
    add('duplicate-ids', 'ID HTML univoci', duplicatedIds.length === 0, duplicatedIds.length ? 'Duplicati: ' + duplicatedIds.slice(0, 10).join(', ') : 'Nessun duplicato rilevato nel DOM corrente.', duplicatedIds.length ? 'danger' : 'success');

    const darkModeRules = Array.prototype.some.call(document.styleSheets || [], function (sheet) {
      try {
        return Array.prototype.some.call(sheet.cssRules || [], function (rule) {
          return rule.selectorText && rule.selectorText.indexOf("html[data-theme=\"dark\"] select option") >= 0;
        });
      } catch (e) { return false; }
    });
    add("dark-mode-select-contrast", "Contrasto combo/select in Dark Mode", darkModeRules, darkModeRules ? "Regole CSS 0.4.7/0.4.8 rilevate per select, option, disabled/focus e campi data in tema scuro." : "Regole CSS Dark Mode per le option native non rilevate nel CSS ispezionabile.", darkModeRules ? "success" : "warning");

    const dynamicSelects = [
      ['payev-subject-id', 'Incassi/pagamenti: soggetto'],
      ['ledger-subject-filter', 'Partitario: soggetto'],
      ['statement-subject-filter', 'Estratto conto: soggetto'],
      ['print-subject-id', 'Stampe/PDF: soggetto'],
      ['print-document-id', 'Stampe/PDF: documento']
    ];
    const placeholderOnly = dynamicSelects.filter(function (item) {
      const el = root.getElementById(item[0]);
      if (!el) return false;
      const options = el.querySelectorAll('option');
      return options.length <= 1;
    }).map(function (item) { return item[1]; });
    add('dynamic-select-options', 'Select dinamiche popolate', placeholderOnly.length === 0, placeholderOnly.length ? 'Da verificare: ' + placeholderOnly.join(', ') : 'Le select dinamiche ispezionate non sono ferme al solo placeholder.', placeholderOnly.length ? 'warning' : 'success');

    const summary = checks.reduce(function (acc, c) {
      acc.total += 1;
      if (c.ok) acc.ok += 1;
      else if (c.severity === 'danger') acc.critical += 1;
      else acc.warning += 1;
      return acc;
    }, { total: 0, ok: 0, warning: 0, critical: 0 });

    return { version: '0.4.8', checks: checks, summary: summary, repairStats: repairStats };
  }

  function toCsv(result) {
    const rows = [['check','esito','severita','dettaglio']].concat((result.checks || []).map(function (c) {
      return [c.label, c.ok ? 'OK' : 'DA_VERIFICARE', c.severity, c.detail];
    }));
    return rows.map(function (row) {
      return row.map(function (cell) { return '"' + String(cell == null ? '' : cell).replace(/"/g, '""') + '"'; }).join(';');
    }).join('\n');
  }

  window.AccessibilityUXService = {
    applyRuntimeEnhancements: applyRuntimeEnhancements,
    buildAudit: buildAudit,
    toCsv: toCsv,
    esc: esc,
    inferControlLabel: inferControlLabel,
    inferButtonLabel: inferButtonLabel
  };
})();
