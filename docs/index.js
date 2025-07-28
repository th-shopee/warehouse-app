document.addEventListener('DOMContentLoaded', () => {
     const whsSelect = document.getElementById('whs_id');
     const currentWhsSpan = document.getElementById('current-whs');

     function fetchWarehouses() {
       console.log('Fetching from:', `${config.backendUrl}/api/warehouses`);
       fetch(`${config.backendUrl}/api/warehouses`, {
         headers: {
           'ngrok-skip-browser-warning': 'true'
         }
       })
         .then(response => {
           console.log('Response status:', response.status);
           if (!response.ok) {
             return response.text().then(text => {
               throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`);
             });
           }
           return response.json();
         })
         .then(warehouses => {
           console.log('Fetched warehouses:', warehouses);
           whsSelect.innerHTML = '<option value="">Select a warehouse</option>';
           if (warehouses.length === 0) {
             console.warn('No warehouses found');
             currentWhsSpan.textContent = 'No warehouses available';
             return;
           }
           warehouses.forEach(whs => {
             const option = document.createElement('option');
             option.value = whs.whs_id;
             option.textContent = whs.whs_name;
             whsSelect.appendChild(option);
           });
           const selectedWhsId = localStorage.getItem('selectedWhsId');
           if (selectedWhsId) {
             whsSelect.value = selectedWhsId;
             const selectedWhs = warehouses.find(whs => whs.whs_id === selectedWhsId);
             currentWhsSpan.textContent = selectedWhs ? selectedWhs.whs_name : 'None selected';
           } else {
             currentWhsSpan.textContent = 'None selected';
           }
         })
         .catch(err => {
           console.error('Error fetching warehouses:', err.message);
           alert('Failed to load warehouses: ' + err.message);
           currentWhsSpan.textContent = 'Error loading warehouses';
         });
     }

     window.addEventListener('storage', (event) => {
       if (event.key === 'refreshWarehouses') {
         fetchWarehouses();
       }
     });

     whsSelect.addEventListener('change', () => {
       localStorage.setItem('selectedWhsId', whsSelect.value);
       fetchWarehouses();
     });

     fetchWarehouses();
   });