document.addEventListener('DOMContentLoaded', () => {
  const locationSelect = document.getElementById('location_id');
  const tableBody = document.getElementById('inventory-table').querySelector('tbody');
  const downloadBtn = document.getElementById('download-csv');
  const currentWhsSpan = document.getElementById('current-whs');
  let inventoryData = [];

  // Display current warehouse
  function displayCurrentWarehouse() {
    const whsId = localStorage.getItem('selectedWhsId');
    if (whsId) {
      fetch('/api/warehouses')
        .then(response => response.json())
        .then(warehouses => {
          const selectedWhs = warehouses.find(whs => whs.whs_id === whsId);
          currentWhsSpan.textContent = selectedWhs ? selectedWhs.whs_name : 'None selected';
        })
        .catch(err => console.error('Error fetching warehouses:', err.message));
    } else {
      currentWhsSpan.textContent = 'None selected';
    }
  }

  // Fetch locations for selected warehouse
  function fetchLocations() {
    const whsId = localStorage.getItem('selectedWhsId');
    if (!whsId) {
      alert('Please select a warehouse on the Home page');
      return;
    }
    locationSelect.innerHTML = '<option value="">All Locations</option>';
    fetch(`/api/locations?whs_id=${whsId}`)
      .then(response => response.json())
      .then(locations => {
        locations.forEach(loc => {
          const option = document.createElement('option');
          option.value = loc.location_id;
          option.textContent = loc.location_name;
          locationSelect.appendChild(option);
        });
      })
      .catch(err => console.error('Error fetching locations:', err.message));
  }

  // Fetch inventory
  function fetchInventory() {
    const whsId = localStorage.getItem('selectedWhsId');
    if (!whsId) {
      alert('Please select a warehouse on the Home page');
      return;
    }
    const locationId = locationSelect.value;
    const params = new URLSearchParams({ whs_id: whsId });
    if (locationId) params.append('location_id', locationId);
    const url = `/api/inventory?${params.toString()}`;
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
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
      })
      .catch(err => alert('Error fetching inventory: ' + err.message));
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

  // Initial setup
  displayCurrentWarehouse();
  fetchLocations();
  fetchInventory();
});