require('dotenv').config();
   const express = require('express');
   const { Pool } = require('pg');
   const cors = require('cors');
   const multer = require('multer');
   const path = require('path');
   const fs = require('fs').promises;
   const ExcelJS = require('exceljs');
   const app = express();
   const port = 5000;

   // Database configuration
   const pool = new Pool({
     user: 'postgres',
     host: 'localhost',
     database: 'warehouse',
     password: process.env.DB_PASSWORD,
     port: 5432,
   });

   // Middleware
   app.use(cors({
     origin: ['http://localhost:5000', 'https://th-shopee.github.io']
   }));
   app.use((req, res, next) => {
     console.log(`Request: ${req.method} ${req.url} from ${req.headers.origin}`);
     next();
   });
   app.use(express.json());
   const upload = multer({ dest: '/tmp/uploads/' });

   // API routes
   app.get('/api/warehouses', async (req, res) => {
     try {
       const result = await pool.query('SELECT * FROM warehouses');
       console.log('Warehouses query result:', result.rows);
       res.json(result.rows);
     } catch (err) {
       console.error('Error fetching warehouses:', err.message);
       res.status(500).json({ error: err.message });
     }
   });

   app.post('/api/warehouses', async (req, res) => {
     const { whs_id, whs_name } = req.body;
     console.log('Creating warehouse:', { whs_id, whs_name });
     if (!whs_id || !whs_name) {
       return res.status(400).json({ error: 'Warehouse ID and name are required' });
     }
     try {
       const result = await pool.query(
         'INSERT INTO warehouses (whs_id, whs_name) VALUES ($1, $2) ON CONFLICT (whs_id) DO NOTHING RETURNING *',
         [whs_id, whs_name]
       );
       if (result.rowCount === 0) {
         return res.status(409).json({ error: 'Warehouse ID already exists' });
       }
       console.log('Warehouse created:', result.rows[0]);
       res.json(result.rows[0]);
     } catch (err) {
       console.error('Error creating warehouse:', err.message);
       res.status(500).json({ error: err.message });
     }
   });

   app.get('/api/locations', async (req, res) => {
     const { whs_id } = req.query;
     try {
       const result = await pool.query(
         'SELECT * FROM locations WHERE whs_id = $1',
         [whs_id]
       );
       console.log('Locations query result:', result.rows);
       res.json(result.rows);
     } catch (err) {
       console.error('Error fetching locations:', err.message);
       res.status(500).json({ error: err.message });
     }
   });

   app.post('/api/input-orders', async (req, res) => {
     const { user_id, order_id, location_id, whs_id } = req.body;
     try {
       const result = await pool.query(
         'INSERT INTO input_orders (order_id, user_id, location_id, whs_id) VALUES ($1, $2, $3, $4) RETURNING *',
         [order_id, user_id, location_id, whs_id]
       );
       await pool.query(
         'INSERT INTO inventory (order_id, location_id, whs_id, status) VALUES ($1, $2, $3, $4)',
         [order_id, location_id, whs_id, 'IN']
       );
       console.log('Input order created:', result.rows[0]);
       res.json(result.rows[0]);
     } catch (err) {
       console.error('Error inserting input order:', err.message);
       res.status(500).json({ error: err.message });
     }
   });

   app.post('/api/output-orders', upload.single('file'), async (req, res) => {
     const { user_id, location_id, whs_id } = req.body;
     const file_path = req.file ? req.file.path : null;
     try {
       const result = await pool.query(
         'INSERT INTO output_orders (order_id, user_id, location_id, whs_id, file_path) VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *',
         [user_id, location_id, whs_id, file_path]
       );
       await pool.query(
         'INSERT INTO inventory (order_id, location_id, whs_id, status) VALUES ($1, $2, $3, $4)',
         [result.rows[0].order_id, location_id, whs_id, 'OUT']
       );
       console.log('Output order created:', result.rows[0]);
       res.json(result.rows[0]);
     } catch (err) {
       console.error('Error inserting output order:', err.message);
       res.status(500).json({ error: err.message });
     }
   });

   app.get('/api/inventory', async (req, res) => {
     const { location_id, whs_id } = req.query;
     try {
       let query = `
         SELECT i.order_id, i.location_id, l.location_name, i.status
         FROM inventory i
         JOIN locations l ON i.location_id = l.location_id AND i.whs_id = l.whs_id
         WHERE i.whs_id = $1
       `;
       const params = [whs_id];
       if (location_id) {
         query += ' AND i.location_id = $2';
         params.push(location_id);
       }
       const result = await pool.query(query, params);
       console.log('Inventory query result:', result.rows);
       res.json(result.rows);
     } catch (err) {
       console.error('Error fetching inventory:', err.message);
       res.status(500).json({ error: err.message });
     }
   });

   app.post('/api/locations', upload.single('file'), async (req, res) => {
     const { whs_id } = req.body;
     if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
     if (!whs_id) return res.status(400).json({ error: 'No warehouse ID provided' });
     try {
       const workbook = new ExcelJS.Workbook();
       await workbook.xlsx.readFile(req.file.path);
       const worksheet = workbook.getWorksheet(1);
       const locations = [];
       worksheet.getColumn('A').eachCell(cell => {
         if (cell.value) locations.push(cell.value.toString().trim());
       });
       for (const name of locations) {
         await pool.query(
           'INSERT INTO locations (location_id, whs_id, location_name) VALUES ($1, $2, $3) ON CONFLICT (location_id, whs_id) DO NOTHING',
           [name, whs_id, name]
         );
       }
       await fs.unlink(req.file.path);
       console.log('Locations updated for whs_id:', whs_id);
       res.json({ message: 'Locations updated successfully' });
     } catch (err) {
       console.error('Error updating locations:', err.message);
       res.status(500).json({ error: err.message });
     }
   });

   app.get('/api/transactions', async (req, res) => {
     const { type, location_id, whs_id } = req.query;
     try {
       let query = `
         SELECT * FROM (
           SELECT 'input' AS type, order_id, user_id, location_id, whs_id, timestamp
           FROM input_orders
           UNION ALL
           SELECT 'output' AS type, order_id, user_id, location_id, whs_id, timestamp
           FROM output_orders
         ) AS transactions
         WHERE whs_id = $1
       `;
       const params = [whs_id];
       const conditions = [];
       if (type) {
         conditions.push(`type = $${params.length + 1}`);
         params.push(type);
       }
       if (location_id) {
         conditions.push(`location_id = $${params.length + 1}`);
         params.push(location_id);
       }
       if (conditions.length > 0) {
         query += ' AND ' + conditions.join(' AND ');
       }
       query += ' ORDER BY timestamp DESC';
       const result = await pool.query(query, params);
       console.log('Transactions query result:', result.rows);
       res.json(result.rows);
     } catch (err) {
       console.error('Error fetching transactions:', err.message);
       res.status(500).json({ error: err.message });
     }
   });

   // Serve static files (after API routes)
   app.use(express.static(path.join(__dirname, 'public')));

   // Start server
   app.listen(port, () => {
     console.log(`Server running at http://localhost:${port}`);
   });