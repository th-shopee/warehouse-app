document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('input-order-form');
  const successMessage = document.getElementById('success-message');
  const currentWhsSpan = document.getElementById('current-whs');
  let lastUserId = '';

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
    const orderId = document.getElementById('order_id').value;
    const userId = document.getElementById('user_id').value;
    const locationId = document.getElementById('location_id').value;
    const whsId = localStorage.getItem('selectedWhsId');

    if (!whsId) {
      alert('Please select a warehouse on the Home page');
      return;
    }

    fetch('/api/input-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, user_id: userId, location_id: locationId, whs_id: whsId })
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(() => {
        // Show success message
        successMessage.style.display = 'block';
        setTimeout(() => successMessage.style.display = 'none', 3000);
        // Clear order_id and location_id, retain user_id
        document.getElementById('order_id').value = '';
        document.getElementById('location_id').value = '';
        lastUserId = userId;
        document.getElementById('user_id').value = lastUserId;
      })
      .catch(err => alert('Error: ' + err.message));
  });

  // Initial setup
  displayCurrentWarehouse();
  document.getElementById('user_id').value = lastUserId;
});