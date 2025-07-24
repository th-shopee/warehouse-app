document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('input-order-form');
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
    const userId = document.getElementById('user_id').value;
    const locationId = locationSelect.value;

    fetch('/api/input-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, location_id: locationId })
    })
      .then(response => response.json())
      .then(() => {
        alert('Order added!');
        form.reset();
      })
      .catch(err => alert('Error: ' + err.message));
  });
});