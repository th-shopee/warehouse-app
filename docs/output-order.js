document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('output-order-form');
  const locationSelect = document.getElementById('location_id');

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

  // Handle form submission
  form.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(form);

    fetch('/api/output-orders', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(() => {
        alert('Order added!');
        form.reset();
      })
      .catch(err => alert('Error: ' + err.message));
  });
});