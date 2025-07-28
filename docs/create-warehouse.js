document.addEventListener('DOMContentLoaded', () => {
       const form = document.getElementById('create-warehouse-form');
       const successMessage = document.getElementById('success-message');
       const currentWhsSpan = document.getElementById('current-whs');

       // Display current warehouse
       function displayCurrentWarehouse() {
         const whsId = localStorage.getItem('selectedWhsId');
         if (whsId) {
           fetch(`${config.backendUrl}/api/warehouses`)
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

       // Handle form submission
       form.addEventListener('submit', e => {
         e.preventDefault();
         const whsId = document.getElementById('whs_id').value;
         const whsName = document.getElementById('whs_name').value;

         fetch(`${config.backendUrl}/api/warehouses`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ whs_id: whsId, whs_name: whsName })
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
               alert('Warehouse created successfully!');
             }
             document.getElementById('whs_id').value = '';
             document.getElementById('whs_name').value = '';
           })
           .catch(err => alert('Error: ' + err.message));
       });

       // Initial setup
       displayCurrentWarehouse();
     });