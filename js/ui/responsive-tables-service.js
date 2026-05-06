// CDSDM 0.13.2 - Tabelle e liste responsive progressive.
(function () {
  const VERSION = '0.13.2';
  const TABLE_SELECTOR = '.table-responsive table.table, table.table';

  function normalizeLabel(text) {
    return String(text || '')
      .replace(/\s+/g, ' ')
      .replace(/[\n\r\t]+/g, ' ')
      .trim();
  }

  function isOptOut(table) {
    return table.classList.contains('cdsdm-mobile-table-optout') ||
      table.closest('.cdsdm-mobile-table-optout') ||
      table.closest('.print-area') ||
      table.closest('[data-mobile-table="off"]');
  }

  function headerLabels(table) {
    const headers = Array.from(table.querySelectorAll('thead th'));
    return headers.map(function (th, index) {
      const label = normalizeLabel(th.getAttribute('data-label') || th.textContent);
      return label || ('Colonna ' + (index + 1));
    });
  }

  function enhanceTable(table) {
    if (!table || isOptOut(table)) return false;
    const labels = headerLabels(table);
    if (!labels.length) return false;

    table.classList.add('cdsdm-mobile-card-table');
    if (!table.closest('.table-responsive')) {
      table.classList.add('cdsdm-mobile-scroll-x');
    }

    Array.from(table.querySelectorAll('tbody tr')).forEach(function (row) {
      const cells = Array.from(row.children).filter(function (cell) {
        return cell.tagName === 'TD' || cell.tagName === 'TH';
      });
      cells.forEach(function (cell, index) {
        if (!cell.hasAttribute('data-label')) {
          cell.setAttribute('data-label', labels[index] || ('Colonna ' + (index + 1)));
        }
      });
    });
    return true;
  }

  function enhanceAll(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll(TABLE_SELECTOR).forEach(enhanceTable);
  }

  function scheduleEnhance(root) {
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(function () { enhanceAll(root); });
    } else {
      setTimeout(function () { enhanceAll(root); }, 0);
    }
  }

  function startObserver() {
    if (!('MutationObserver' in window)) return;
    const observer = new MutationObserver(function (mutations) {
      let needsEnhance = false;
      mutations.forEach(function (mutation) {
        Array.from(mutation.addedNodes || []).forEach(function (node) {
          if (!node || node.nodeType !== 1) return;
          if ((node.matches && node.matches(TABLE_SELECTOR)) || (node.querySelector && node.querySelector(TABLE_SELECTOR))) {
            needsEnhance = true;
          }
        });
      });
      if (needsEnhance) scheduleEnhance(document);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    enhanceAll(document);
    startObserver();
    document.body.classList.add('cdsdm-responsive-tables-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CDSDMResponsiveTables = {
    version: VERSION,
    enhanceTable: enhanceTable,
    enhanceAll: enhanceAll
  };
})();
