// Rutas de reservas (reservations)
const express = require('express');
const router = express.Router();
const pool = require('../config/postgres');

// Obtener reservas por ID de ruta
router.get('/route/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const query = `
      SELECT * FROM reservations
      WHERE route_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const result = await pool.query(query, [routeId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las reservas
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT
        r.*,
        u.full_name as user_name,
        u.email as user_email
      FROM reservations r
      LEFT JOIN users u ON r.passenger_id = u.id::text
      ORDER BY r.created_at DESC
      LIMIT 100
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});module.exports = router;