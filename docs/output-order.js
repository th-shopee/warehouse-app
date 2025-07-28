document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('output-order-form');
  const successMessage = document.getElementById('success-message');
  const currentWhsSpan = document.getElementById('current-whs');

  function displayCurrentWarehouse() {
    const whsId = localStorage.getItem('selectedWhsId');
    if (whsId) {
      fetch(`${config.backendUrl}/api/warehouses`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      })
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return response.json();
        })
        .then(warehouses => {
          const selectedWhs = warehouses.find(whs => whs.whs_id === whsId);
          currentWhsSpan.textContent = selectedWhs ? selectedWhs.whs_name : 'None selected';
        })
        .catch(err => console.error('Error fetching warehouses:', err.message));
    } else {
      currentWhsSpan.textContent = 'None selected';
    }
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(form);
    const userId = document.getElementById('user_id').value;
    const locationId = document.getElementById('location_id').value;
    const whsId = localStorage.getItem('selectedWhsId');

    if (!whsId) {
      alert('Please select a warehouse on the Home page');
      return;
    }

    formData.append('user_id', userId);
    formData.append('location_id', locationId);
    formData.append('whs_id', whsId);

    fetch(`${config.backendUrl}/api/output-orders`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      },
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.error || `HTTP error! Status: ${response.status}`); });
        }
        return response.json();
      })
      .then(() => {
        if (successMessage) {
          successMessage.style.display = 'block';
          setTimeout(() => successMessage.style.display = 'none', 3000);
        } else {
          console.warn('Success message element not found');
          alert('Order submitted successfully!');
        }
        form.reset();
      })
      .catch(err => alert('Error: ' + err.message));
  });

  displayCurrentWarehouse();
});