document.addEventListener('DOMContentLoaded', () => {
     const form = document.getElementById('update-locations-form');
     const successMessage = document.getElementById('success-message');
     const currentWhsSpan = document.getElementById('current-whs');

     // Display current warehouse
     function displayCurrentWarehouse() {
       const whsId = localStorage.getItem('selectedWhsId');
       if (whsId) {
         fetch(`${config.backendUrl}/api/warehouses`)
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
       const fileInput = document.getElementById('file');
       const whsId = localStorage.getItem('selectedWhsId');

       if (!whsId) {
         alert('Please select a warehouse on the Home page');
         return;
       }

       const formData = new FormData();
       formData.append('whs_id', whsId);
       formData.append('file', fileInput.files[0]);

       fetch(`${config.backendUrl}/api/locations`, {
         method: 'POST',
         body: formData
       })
         .then(response => {
           if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
           return response.json();
         })
         .then(() => {
           successMessage.style.display = 'block';
           setTimeout(() => successMessage.style.display = 'none', 3000);
           fileInput.value = '';
         })
         .catch(err => alert('Error: ' + err.message));
     });

     // Initial setup
     displayCurrentWarehouse();
   });