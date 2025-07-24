document.addEventListener('DOMContentLoaded', () => {
  const locationSelect = document.getElementById('location_id');
  const tableBody = document.getElementById('inventory-table').querySelector('tbody');
  const downloadBtn = document.getElementById('download-csv');
  let inventoryData = [];

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

  // Fetch inventory
  function fetchInventory() {
    const locationId = locationSelect.value;
    const url = locationId ? `/api/inventory?location_id=${locationId}` : '/api/inventory';
    fetch(url)
      .then(response => response.json())
      .then(data => {
        inventoryData = data;
        tableBody.innerHTML = '';
        data.forEach(item => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${item.order_id}</td>
            <td>${item.location_name}</td>
            <td>${item.status}</td>
          `;
          tableBody.appendChild(row);
        });
      });
  }

  // Download CSV
  downloadBtn.addEventListener('click', () => {
    const csv = ['Order ID,Location,Status'];
    inventoryData.forEach(item => {
      csv.push(`${item.order_id},${item.location_name},${item.status}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Filter on location change
  locationSelect.addEventListener('change', fetchInventory);

  // Initial fetch
  fetchInventory();
});