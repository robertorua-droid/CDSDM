(function () {
  const results = [];
  function assert(name, condition) {
    results.push({ name, pass: !!condition });
  }

  fetch('../index.html')
    .then((response) => response.text())
    .then((html) => {
      const accountingSection = html.includes('id="section-contabilita"') && html.includes('Contabilità');
      const scadInAccounting = /section-contabilita[\s\S]*data-target="scadenziario"/.test(html);
      const vatInAccounting = /section-contabilita[\s\S]*data-target="registri-iva"/.test(html);
      const analysisBlock = (html.match(/id="section-analisi"[\s\S]*?<!-- CONTABILITÀ -->/) || [''])[0];

      assert('Esiste la sezione Contabilità', accountingSection);
      assert('Scadenziario è nella sezione Contabilità', scadInAccounting);
      assert('Registri IVA è nella sezione Contabilità', vatInAccounting);
      assert('Analisi non contiene più Scadenziario', !analysisBlock.includes('data-target="scadenziario"'));
      assert('Analisi non contiene più Registri IVA', !analysisBlock.includes('data-target="registri-iva"'));
      renderResults(results);
    })
    .catch((error) => {
      renderResults([{ name: 'Caricamento index.html', pass: false, details: error.message }]);
    });

  function renderResults(items) {
    const host = document.getElementById('test-results');
    const failed = items.filter((item) => !item.pass);
    host.innerHTML = `
      <div class="alert ${failed.length ? 'alert-danger' : 'alert-success'}">
        ${failed.length ? 'Test falliti' : 'Tutti i test superati'} (${items.length - failed.length}/${items.length})
      </div>
      <ul class="list-group">
        ${items.map((item) => `<li class="list-group-item d-flex justify-content-between"><span>${item.name}</span><span class="badge ${item.pass ? 'text-bg-success' : 'text-bg-danger'}">${item.pass ? 'OK' : 'KO'}</span></li>`).join('')}
      </ul>`;
  }
})();
