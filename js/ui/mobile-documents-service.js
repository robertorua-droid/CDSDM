// js/ui/mobile-documents-service.js
// CDSDM 0.13.5 - Miglioramenti mobile non invasivi per form complessi e documenti gestionali.
(function () {
  'use strict';

  const VERSION = '0.13.5';
  const MOBILE_QUERY = '(max-width: 575.98px)';
  const DOCUMENT_SECTION_IDS = [
    'nuova-fattura-accompagnatoria',
    'elenco-fatture',
    'preventivi',
    'ordini-cliente',
    'ordini-fornitore',
    'ddt-fornitore',
    'ddt-cliente',
    'fatturazione-ddt-cliente',
    'nuovo-acquisto',
    'elenco-acquisti',
    'magazzino-movimenti',
    'magazzino-inventario-fisico',
    'magazzino-inventario',
    'magazzino-lotti',
    'magazzino-quarantena'
  ];
  let observer = null;

  function isMobile() {
    return window.matchMedia && window.matchMedia(MOBILE_QUERY).matches;
  }

  function ensureHint(section) {
    if (!section || section.querySelector('.cdsdm-mobile-documents-hint')) return;
    const firstCard = section.querySelector('.card, .table-responsive, form');
    if (!firstCard || !firstCard.parentNode) return;
    const hint = document.createElement('div');
    hint.className = 'alert alert-light border small cdsdm-mobile-documents-hint mb-3';
    hint.innerHTML = '<strong>Vista mobile documenti:</strong> usa lo smartphone per consultare, controllare stati e compilare modifiche brevi. Per documenti con molte righe, import/export o stampa finale resta consigliato desktop/tablet.';
    firstCard.parentNode.insertBefore(hint, firstCard);
  }

  function enhanceControls(section) {
    if (!section) return;
    section.querySelectorAll('form, .card, .modal-content').forEach(el => {
      el.classList.add('cdsdm-mobile-document-surface');
    });
    section.querySelectorAll('.row.g-2, .row.g-3, .row.align-items-end, .row.g-2.align-items-end').forEach(row => {
      row.classList.add('cdsdm-mobile-document-row');
    });
    section.querySelectorAll('.form-control, .form-select, textarea, input, select').forEach(control => {
      control.classList.add('cdsdm-mobile-document-control');
    });
    section.querySelectorAll('.btn-group, .btn-toolbar, .input-group').forEach(group => {
      group.classList.add('cdsdm-mobile-document-action-group');
    });
    section.querySelectorAll('.btn').forEach(btn => {
      btn.classList.add('cdsdm-mobile-document-action');
    });
    section.querySelectorAll('.table-responsive').forEach(wrapper => {
      wrapper.classList.add('cdsdm-mobile-document-table-wrapper');
    });
    section.querySelectorAll('table').forEach(table => {
      table.classList.add('cdsdm-mobile-document-table');
    });
  }

  function enhanceModals() {
    document.querySelectorAll('.modal-dialog').forEach(dialog => {
      dialog.classList.add('cdsdm-mobile-document-modal');
    });
    document.querySelectorAll('.modal-footer').forEach(footer => {
      footer.classList.add('cdsdm-mobile-document-modal-footer');
    });
  }

  function enhanceSections() {
    DOCUMENT_SECTION_IDS.forEach(id => {
      const section = document.getElementById(id);
      if (!section) return;
      section.classList.add('cdsdm-mobile-documents-ready');
      ensureHint(section);
      enhanceControls(section);
    });
    enhanceModals();
    document.documentElement.classList.toggle('cdsdm-is-mobile-documents-viewport', isMobile());
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

  window.MobileDocumentsService = {
    VERSION,
    DOCUMENT_SECTION_IDS,
    init,
    enhanceSections
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
