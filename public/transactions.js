document.addEventListener('DOMContentLoaded', () => {
     const transactionsTable = document.getElementById('transactions-table').getElementsByTagName('tbody')[0];
     const typeFilter = document.getElementById('type');
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

     // Fetch and display transactions
     function fetchTransactions() {
       const whsId = localStorage.getItem('selectedWhsId');
       const type = typeFilter.value;
       const locationId = locationFilter.value;

       if (!whsId) {
         alert('Please select a warehouse on the Home page');
         return;
       }

       let query = `?whs_id=${whsId}`;
       if (type) query += `&type=${type}`;
       if (locationId) query += `&location_id=${locationId}`;

       fetch(`${config.backendUrl}/api/transactions${query}`)
         .then(response => response.json())
         .then(transactions => {
           transactionsTable.innerHTML = '';
           transactions.forEach(tx => {
             const row = transactionsTable.insertRow();
             row.insertCell(0).textContent = tx.type;
             row.insertCell(1).textContent = tx.order_id;
             row.insertCell(2).textContent = tx.user_id;
             row.insertCell(3).textContent = tx.location_id;
             row.insertCell(4).textContent = tx.whs_id;
             row.insertCell(5).textContent = new Date(tx.timestamp).toLocaleString();
           });
         })
         .catch(err => console.error('Error fetching transactions:', err.message));
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
     typeFilter.addEventListener('change', fetchTransactions);
     locationFilter.addEventListener('change', fetchTransactions);

     // Initial setup
     displayCurrentWarehouse();
     populateLocations();
     fetchTransactions();
   });