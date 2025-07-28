document.addEventListener('DOMContentLoaded', () => {
     const form = document.getElementById('create-warehouse-form');
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
       const whsId = document.getElementById('whs_id').value;
       const whsName = document.getElementById('whs_name').value;

       fetch(`${config.backendUrl}/api/warehouses`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'ngrok-skip-browser-warning': 'true'
         },
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
           localStorage.setItem('refreshWarehouses', Date.now().toString());
         })
         .catch(err => alert('Error: ' + err.message));
     });

     displayCurrentWarehouse();
   });