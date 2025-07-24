document.addEventListener('DOMContentLoaded', () => {
  const typeSelect = document.getElementById('type');
  const locationSelect = document.getElementById('location_id');
  const tableBody = document.getElementById('transactions-table').querySelector('tbody');
  const downloadBtn = document.getElementById('download-csv');
  let transactionsData = [];

  // Fetch locations
  fetch('/api/locations')
    .then(response => response.json())
    .then(locations => {
      locations.forEach(loc => {
        const option = document.createElement('option');
        option.value = loc.location_id;
        option.textContent = loc.location_name;
        locationSelect.appendChild(option);
      });
    });

  // Fetch transactions
  function fetchTransactions() {
    const type = typeSelect.value;
    const locationId = locationSelect.value;
    let url = '/api/transactions';
    const params = [];
    if (type) params.push(`type=${type}`);
    if (locationId) params.push(`location_id=${locationId}`);
    if (params.length) url += `?${params.join('&')}`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        transactionsData = data;
        tableBody.innerHTML = '';
        data.forEach(item => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${item.type}</td>
            <td>${item.order_id}</td>
            <td>${item.user_id}</td>
            <td>${item.location_id}</td>
            <td>${new Date(item.timestamp).toLocaleString()}</td>
          `;
          tableBody.appendChild(row);
        });
      });
  }

  // Download CSV
  downloadBtn.addEventListener('click', () => {
    const csv = ['Type,Order ID,User ID,Location ID,Timestamp'];
    transactionsData.forEach(item => {
      csv.push(`${item.type},${item.order_id},${item.user_id},${item.location_id},${item.timestamp}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Filter on change
  typeSelect.addEventListener('change', fetchTransactions);
  locationSelect.addEventListener('change', fetchTransactions);

  // Initial fetch
  fetchTransactions();
});