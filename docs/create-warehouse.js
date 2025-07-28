document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('create-warehouse-form');
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

  // Handle form submission
  form.addEventListener('submit', e => {
    e.preventDefault();
    const whsId = document.getElementById('whs_id').value;
    const whsName = document.getElementById('whs_name').value;

    fetch('/api/warehouses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whs_id: whsId, whs_name: whsName })
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(() => {
        alert('Warehouse created successfully!');
        form.reset();
      })
      .catch(err => alert('Error: ' + err.message));
  });

  // Initial setup
  displayCurrentWarehouse();
});