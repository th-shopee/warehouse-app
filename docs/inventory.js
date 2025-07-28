document.addEventListener('DOMContentLoaded', () => {
     const inventoryTable = document.getElementById('inventory-table').getElementsByTagName('tbody')[0];
     const locationFilter = document.getElementById('location_id');
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

     // Fetch and display inventory
     function fetchInventory() {
       const whsId = localStorage.getItem('selectedWhsId');
       const locationId = locationFilter.value;
       if (!whsId) {
         alert('Please select a warehouse on the Home page');
         return;
       }

       const query = locationId ? `?whs_id=${whsId}&location_id=${locationId}` : `?whs_id=${whsId}`;
       fetch(`${config.backendUrl}/api/inventory${query}`)
         .then(response => response.json())
         .then(items => {
           inventoryTable.innerHTML = '';
           items.forEach(item => {
             const row = inventoryTable.insertRow();
             row.insertCell(0).textContent = item.order_id;
             row.insertCell(1).textContent = item.location_id;
             row.insertCell(2).textContent = item.location_name;
             row.insertCell(3).textContent = item.status;
           });
         })
         .catch(err => console.error('Error fetching inventory:', err.message));
     }

     // Populate location filter
     function populateLocations() {
       const whsId = localStorage.getItem('selectedWhsId');
       if (!whsId) return;
       fetch(`${config.backendUrl}/api/locations?whs_id=${whsId}`)
         .then(response => response.json())
         .then(locations => {
           locationFilter.innerHTML = '<option value="">All Locations</option>';
           locations.forEach(loc => {
             const option = document.createElement('option');
             option.value = loc.location_id;
             option.textContent = loc.location_name;
             locationFilter.appendChild(option);
           });
         })
         .catch(err => console.error('Error fetching locations:', err.message));
     }

     // Event listeners
     locationFilter.addEventListener('change', fetchInventory);

     // Initial setup
     displayCurrentWarehouse();
     populateLocations();
     fetchInventory();
   });