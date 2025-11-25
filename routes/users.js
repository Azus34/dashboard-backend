// Rutas de usuarios (conductores y pasajeros)
const express = require('express');
const router = express.Router();
const pool = require('../config/postgres');

// Obtener todos los conductores
router.get('/drivers', async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.full_name, u.email, dp.phone_number, dp.license_number, 
             dp.vehicle_brand, dp.vehicle_model, dp.vehicle_year, dp.status, dp.rating_avg
      FROM users u
      JOIN driver_profiles dp ON u.id = dp.user_id
      LIMIT 100
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener conductor por ID
router.get('/drivers/:id', async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.full_name, u.email, dp.phone_number, dp.license_number, 
             dp.vehicle_brand, dp.vehicle_model, dp.vehicle_year, dp.status, dp.rating_avg
      FROM users u
      JOIN driver_profiles dp ON u.id = dp.user_id
      WHERE u.id = $1
    `;
    const result = await pool.query(query, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conductor no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los pasajeros
router.get('/customers', async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.full_name, u.email, cp.phone_number, cp.default_country, 
             cp.preferences, cp.status, wa.balance_cents
      FROM users u
      JOIN customer_profiles cp ON u.id = cp.user_id
      LEFT JOIN wallet_accounts wa ON u.id = wa.user_id
      LIMIT 100
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener pasajero por ID
router.get('/customers/:id', async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.full_name, u.email, cp.phone_number, cp.default_country, 
             cp.preferences, cp.status, wa.balance_cents
      FROM users u
      JOIN customer_profiles cp ON u.id = cp.user_id
      LEFT JOIN wallet_accounts wa ON u.id = wa.user_id
      WHERE u.id = $1
    `;
    const result = await pool.query(query, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pasajero no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
