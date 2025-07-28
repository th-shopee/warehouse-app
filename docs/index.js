document.addEventListener('DOMContentLoaded', () => {
     const whsSelect = document.getElementById('whs_id');
     const currentWhsSpan = document.getElementById('current-whs');

     // Fetch warehouses
     function fetchWarehouses() {
       fetch(`${config.backendUrl}/api/warehouses`)
         .then(response => response.json())
         .then(warehouses => {
           whsSelect.innerHTML = '<option value="">Select a warehouse</option>';
           warehouses.forEach(whs => {
             const option = document.createElement('option');
             option.value = whs.whs_id;
             option.textContent = whs.whs_name;
             whsSelect.appendChild(option);
           });
           // Restore and display selected warehouse
           const selectedWhsId = localStorage.getItem('selectedWhsId');
           if (selectedWhsId) {
             whsSelect.value = selectedWhsId;
             const selectedWhs = warehouses.find(whs => whs.whs_id === selectedWhsId);
             currentWhsSpan.textContent = selectedWhs ? selectedWhs.whs_name : 'None selected';
           } else {
             currentWhsSpan.textContent = 'None selected';
           }
         })
         .catch(err => console.error('Error fetching warehouses:', err.message));
     }

     // Save selected warehouse
     whsSelect.addEventListener('change', () => {
       localStorage.setItem('selectedWhsId', whsSelect.value);
       fetchWarehouses(); // Refresh to update current warehouse display
     });

     // Initial fetch
     fetchWarehouses();
   });