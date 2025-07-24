document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('locations-form');

  // Handle form submission
  form.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(form);

    fetch('/api/locations', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(() => {
        alert('Locations updated!');
        form.reset();
      })
      .catch(err => alert('Error: ' + err.message));
  });
});