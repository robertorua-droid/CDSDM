// js/ui/mobile-bi-service.js
// CDSDM 0.13.4 - Miglioramenti mobile non invasivi per Mini B.I. sintetica.
(function () {
  'use strict';

  const VERSION = '0.13.4';
  const MOBILE_QUERY = '(max-width: 575.98px)';
  let observer = null;

  function isMobile() {
    return window.matchMedia && window.matchMedia(MOBILE_QUERY).matches;
  }

  function ensureHint(section) {
    if (!section || section.querySelector('#mini-bi-mobile-hint-0134')) return;
    const overview = section.querySelector('#mini-bi-overview') || section.querySelector('.card');
    if (!overview || !overview.parentNode) return;
    const hint = document.createElement('div');
    hint.id = 'mini-bi-mobile-hint-0134';
    hint.className = 'alert alert-light border small cdsdm-mobile-bi-hint mb-3';
    hint.innerHTML = '<strong>Vista mobile Mini B.I.:</strong> parti dalle card KPI, poi apri il drill-down solo quando serve. Su smartphone catalogo, QA e tabelle restano disponibili ma sono pensati per consultazione sintetica.';
    overview.parentNode.insertBefore(hint, overview);
  }

  function enhanceTabs(section) {
    if (!section) return;
    const group = section.querySelector('[aria-label="Aree Mini B.I."]');
    if (group) group.classList.add('cdsdm-mobile-bi-tabs');
    section.querySelectorAll('.mini-bi-area-tab').forEach(btn => {
      btn.classList.add('cdsdm-mobile-bi-tab');
    });
  }

  function enhanceCards(section) {
    if (!section) return;
    section.querySelectorAll('.mini-bi-kpi-card').forEach(card => {
      card.classList.add('cdsdm-mobile-bi-kpi');
    });
  }

  function enhanceActions(section) {
    if (!section) return;
    section.querySelectorAll('#mini-bi-refresh-btn, #mini-bi-export-csv-btn, #mini-bi-print-report-btn, .mini-bi-create-operational-report').forEach(btn => {
      btn.classList.add('cdsdm-mobile-bi-action');
    });
    section.querySelectorAll('#mini-bi-drilldown-card .btn-group, #mini-bi-alerts .btn-group').forEach(group => {
      group.classList.add('cdsdm-mobile-bi-action-group');
    });
  }

  function enhanceTables(section) {
    if (!section) return;
    section.querySelectorAll('table').forEach(table => {
      table.classList.add('cdsdm-mobile-bi-table');
    });
    section.querySelectorAll('.table-responsive').forEach(wrapper => {
      wrapper.classList.add('cdsdm-mobile-bi-table-wrapper');
    });
  }

  function enhanceSections() {
    const section = document.getElementById('mini-bi');
    if (!section) return;
    section.classList.add('cdsdm-mobile-bi-ready');
    ensureHint(section);
    enhanceTabs(section);
    enhanceCards(section);
    enhanceActions(section);
    enhanceTables(section);
    document.documentElement.classList.toggle('cdsdm-is-mobile-bi-viewport', isMobile());
  }

  function init() {
    enhanceSections();
    if (observer) return;
    observer = new MutationObserver(() => enhanceSections());
    observer.observe(document.body, { childList: true, subtree: true });
    if (window.matchMedia) {
      const mq = window.matchMedia(MOBILE_QUERY);
      const onChange = () => enhanceSections();
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  window.MobileBIService = {
    VERSION,
    init,
    enhanceSections
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
