document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('locations-form');
  const tableBody = document.getElementById('locations-table').querySelector('tbody');
  const currentWhsSpan = document.getElementById('current-whs');

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

  // Fetch and display locations
  function fetchLocations() {
    const whsId = localStorage.getItem('selectedWhsId');
    if (!whsId) {
      alert('Please select a warehouse on the Home page');
      return;
    }
    fetch(`/api/locations?whs_id=${whsId}`)
      .then(response => response.json())
      .then(locations => {
        tableBody.innerHTML = '';
        locations.forEach(loc => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${loc.location_id}</td>
            <td>${loc.location_name}</td>
          `;
          tableBody.appendChild(row);
        });
      })
      .catch(err => alert('Error fetching locations: ' + err.message));
  }

  // Handle form submission
  form.addEventListener('submit', e => {
    e.preventDefault();
    const whsId = localStorage.getItem('selectedWhsId');
    if (!whsId) {
      alert('Please select a warehouse on the Home page');
      return;
    }
    const formData = new FormData(form);
    formData.append('whs_id', whsId);

    fetch('/api/locations', {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(() => {
        alert('Locations updated!');
        form.reset();
        fetchLocations(); // Refresh table
      })
      .catch(err => alert('Error: ' + err.message));
  });

  // Initial setup
  displayCurrentWarehouse();
  fetchLocations();
});