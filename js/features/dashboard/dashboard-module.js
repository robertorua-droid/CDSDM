// js/features/dashboard/dashboard-module.js
// Dashboard Direzionale 0.2.1 (Annuale/Mensile) - modulo separato

(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.dashboard = window.AppModules.dashboard || {};

  let _bound = false;

  function bind() {
    if (_bound) return;
    _bound = true;

    // Toggle mese
    function syncMonthVisibility() {
      const mode = String($('#dash-mode').val() || 'year');
      if (mode === 'month') {
        $('#dash-month-wrap').show();
      } else {
        $('#dash-month-wrap').hide();
      }
    }

    // Handlers
    $('#dash-mode').on('change', function () {
      syncMonthVisibility();
      if (typeof renderDashboardPage === 'function') renderDashboardPage();
    });

    $('#dash-year, #dash-month').on('change', function () {
      if (typeof renderDashboardPage === 'function') renderDashboardPage();
    });

    $('#dash-refresh-btn').on('click', function () {
      if (typeof renderDashboardPage === 'function') renderDashboardPage();
    });

    if (window.AppStore && typeof window.AppStore.subscribe === 'function') {
      ['invoices','purchases','products','worklogs','customerDDTs','customerOrders','supplierOrders','customers'].forEach(function (key) {
        window.AppStore.subscribe(key, function () {
          if (!$('#dashboard').hasClass('d-none') && typeof renderDashboardPage === 'function') renderDashboardPage();
        });
      });
    }

    // Stato iniziale
    syncMonthVisibility();
  }

  window.AppModules.dashboard.bind = bind;
})();
