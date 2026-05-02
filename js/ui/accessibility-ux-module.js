// js/ui/accessibility-ux-module.js
// CDSDM 0.4.8 - UI accessibilita, Dark Mode e select dinamiche

(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.accessibilityUx = window.AppModules.accessibilityUx || {};
  let _bound = false;

  function esc(v) { return window.AccessibilityUXService ? window.AccessibilityUXService.esc(v) : String(v == null ? '' : v); }

  function badge(c) {
    if (c.ok) return '<span class="badge text-bg-success">OK</span>';
    if (c.severity === 'danger') return '<span class="badge text-bg-danger">Critico</span>';
    return '<span class="badge text-bg-warning">Da verificare</span>';
  }

  function renderSummary(summary) {
    const cards = [
      ['Controlli', summary.total, 'secondary'],
      ['OK', summary.ok, 'success'],
      ['Attenzioni', summary.warning, 'warning'],
      ['Critici', summary.critical, 'danger']
    ];
    $('#ux-a11y-summary').html(cards.map(function (c) {
      return '<div class="col-sm-6 col-xl-3"><div class="card h-100"><div class="card-body"><div class="text-muted small">' + c[0] + '</div><div class="display-6 text-' + c[2] + '">' + c[1] + '</div></div></div></div>';
    }).join(''));
  }

  function renderTable(checks) {
    $('#ux-a11y-table-body').html((checks || []).map(function (c) {
      return '<tr><td>' + badge(c) + '</td><td><strong>' + esc(c.label) + '</strong><div class="text-muted small">' + esc(c.id) + '</div></td><td>' + esc(c.detail) + '</td></tr>';
    }).join('') || '<tr><td colspan="3" class="text-center text-muted py-4">Nessun controllo disponibile.</td></tr>');
  }

  function render() {
    if (!window.AccessibilityUXService) {
      $('#ux-a11y-status').html('<div class="alert alert-danger">AccessibilityUXService non disponibile.</div>');
      return;
    }
    window.AccessibilityUXService.applyRuntimeEnhancements();
    const result = window.AccessibilityUXService.buildAudit(document);
    window._lastAccessibilityUxResult = result;
    renderSummary(result.summary || {});
    renderTable(result.checks || []);
    $('#ux-a11y-status').html('<div class="alert alert-light border small mb-0">Consolidamento 0.4.8: controlli consultivi client-side con correzione runtime di label/aria, nomi pulsante, verifica stili Dark Mode e controllo delle select dinamiche più critiche. Non modifica i dati applicativi.</div>');
  }

  function downloadCsv() {
    const result = window._lastAccessibilityUxResult || (window.AccessibilityUXService && window.AccessibilityUXService.buildAudit(document));
    if (!result || !window.AccessibilityUXService) return;
    const blob = new Blob([window.AccessibilityUXService.toCsv(result)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ux-accessibilita-0.4.8.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function bind() {
    if (_bound) return;
    _bound = true;
    $(document).on('click', '#ux-a11y-refresh-btn', render);
    $(document).on('click', '#ux-a11y-export-csv-btn', downloadCsv);
    $(document).on('keydown', '.nav-section-header', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        $(this).trigger('click');
      }
    });
    $(document).on('click', '.nav-section-header', function () {
      const expanded = !$(this).closest('.nav-section-container').hasClass('collapsed');
      $(this).attr('aria-expanded', expanded ? 'true' : 'false');
    });
    $(document).on('click', '.sidebar .nav-link[data-target]', function () {
      setTimeout(function () { if (window.AccessibilityUXService) window.AccessibilityUXService.applyRuntimeEnhancements(); }, 0);
    });
    if (window.AccessibilityUXService) window.AccessibilityUXService.applyRuntimeEnhancements();
  }

  window.AppModules.accessibilityUx.render = render;
  window.AppModules.accessibilityUx.bind = bind;
})();
