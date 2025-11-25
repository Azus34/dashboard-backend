// Rutas de transacciones
const express = require('express');
const router = express.Router();
const pool = require('../config/postgres');

// Obtener todas las transacciones
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT * FROM wallet_ledger 
      ORDER BY created_at DESC 
      LIMIT 100
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener transacción por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT wl.*, u.full_name, u.email, dp.phone_number, dp.license_number
      FROM wallet_ledger wl
      LEFT JOIN users u ON wl.user_id = u.id
      LEFT JOIN driver_profiles dp ON u.id = dp.user_id
      WHERE wl.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener transacciones por usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `
      SELECT wl.* FROM wallet_ledger wl
      WHERE wl.user_id = $1
      ORDER BY wl.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
