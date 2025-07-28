document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('output-order-form');
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
    const whsId = localStorage.getItem('selectedWhsId');
    if (!whsId) {
      alert('Please select a warehouse on the Home page');
      return;
    }
    const formData = new FormData(form);
    formData.append('whs_id', whsId);

    fetch('/api/output-orders', {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(() => {
        alert('Order added!');
        form.reset();
      })
      .catch(err => alert('Error: ' + err.message));
  });

  // Initial setup
  displayCurrentWarehouse();
});