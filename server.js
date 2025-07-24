const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 5000;

// Database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'warehouse',
  password: '123321', // Replace with your PostgreSQL password
  port: 5432,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from 'public' folder
const upload = multer({ dest: 'uploads/' });

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get locations for dropdowns
app.get('/api/locations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM locations');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Input Orders
app.post('/api/input-orders', async (req, res) => {
  const { user_id, location_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO input_orders (user_id, location_id) VALUES ($1, $2) RETURNING *',
      [user_id, location_id]
    );
    await pool.query(
      'INSERT INTO inventory (order_id, location_id, status) VALUES ($1, $2, $3)',
      [result.rows[0].order_id, location_id, 'IN']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Output Orders
app.post('/api/output-orders', upload.single('file'), async (req, res) => {
  const { user_id, location_id } = req.body;
  const file_path = req.file ? req.file.path : null;
  try {
    const result = await pool.query(
      'INSERT INTO output_orders (user_id, location_id, file_path) VALUES ($1, $2, $3) RETURNING *',
      [user_id, location_id, file_path]
    );
    await pool.query(
      'INSERT INTO inventory (order_id, location_id, status) VALUES ($1, $2, $3)',
      [result.rows[0].order_id, location_id, 'OUT']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. View Current Inventory
app.get('/api/inventory', async (req, res) => {
  const { location_id } = req.query;
  try {
    let query = `
      SELECT i.order_id, i.location_id, l.location_name, i.status
      FROM inventory i
      JOIN locations l ON i.location_id = l.location_id
    `;
    const params = [];
    if (location_id) {
      query += ' WHERE i.location_id = $1';
      params.push(location_id);
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Update Locations
app.post('/api/locations', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const locations = fs.readFileSync(req.file.path, 'utf-8').split('\n').filter(Boolean);
  try {
    for (const name of locations) {
      await pool.query('INSERT INTO locations (location_name) VALUES ($1) ON CONFLICT DO NOTHING', [name.trim()]);
    }
    res.json({ message: 'Locations updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Historical Transactions
app.get('/api/transactions', async (req, res) => {
  const { type, location_id } = req.query;
  try {
    let query = `
      SELECT 'input' AS type, order_id, user_id, location_id, timestamp
      FROM input_orders
      UNION ALL
      SELECT 'output' AS type, order_id, user_id, location_id, timestamp
      FROM output_orders
    `;
    const params = [];
    if (type || location_id) {
      query += ' WHERE';
      if (type) {
        query += ` type = $${params.length + 1}`;
        params.push(type);
      }
      if (location_id) {
        query += params.length ? ' AND' : '';
        query += ` location_id = $${params.length + 1}`;
        params.push(location_id);
      }
    }
    query += ' ORDER BY timestamp DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});