(function () {
  function assert(name, condition) {
    const div = document.createElement('div');
    div.textContent = (condition ? '✓ ' : '✗ ') + name;
    div.style.color = condition ? 'green' : 'red';
    document.body.appendChild(div);
    if (!condition) throw new Error(name);
  }
  const q = window.DomainNormalizers.normalizeQuote({
    numero: 'PR-2026-0001', stato: 'accettato', clienteId: 7, clienteNome: 'Cliente Demo',
    righe: [{ prodottoId: 3, codice: 'PROD-1', descrizione: 'Prodotto demo', quantita: '2', prezzo: '10.50' }]
  });
  assert('normalizza stato accettato', q.status === 'accepted');
  assert('calcola totale preventivo', q.total === 21);
  assert('mantiene cliente', q.customerId === '7' && q.customerName === 'Cliente Demo');
})();
