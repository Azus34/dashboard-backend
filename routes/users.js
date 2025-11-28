// Rutas de usuarios (conductores y pasajeros)
const express = require('express');
const router = express.Router();
const pool = require('../config/postgres');

// Obtener todos los conductores
// Usando INNER JOIN: users -> user_roles -> roles (donde roles.code = 'DRIVER')
router.get('/drivers', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, 
        u.full_name, 
        u.email, 
        u.is_active,
        u.created_at,
        u.date_birth,
        r.code as role,
        r.label as role_label
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id
      INNER JOIN roles r ON ur.role_id = r.id
      WHERE r.code = 'DRIVER'
      ORDER BY u.created_at DESC
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
      SELECT 
        u.id, 
        u.full_name, 
        u.email, 
        u.is_active,
        u.created_at,
        u.date_birth,
        r.code as role,
        r.label as role_label
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id
      INNER JOIN roles r ON ur.role_id = r.id
      WHERE r.code = 'DRIVER' AND u.id = $1
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

// Obtener todos los pasajeros (customers/users)
// Usando INNER JOIN: users -> user_roles -> roles (donde roles.code = 'USER')
router.get('/customers', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, 
        u.full_name, 
        u.email, 
        u.is_active,
        u.created_at,
        u.date_birth,
        r.code as role,
        r.label as role_label
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id
      INNER JOIN roles r ON ur.role_id = r.id
      WHERE r.code = 'USER'
      ORDER BY u.created_at DESC
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
      SELECT 
        u.id, 
        u.full_name, 
        u.email, 
        u.is_active,
        u.created_at,
        u.date_birth,
        r.code as role,
        r.label as role_label
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id
      INNER JOIN roles r ON ur.role_id = r.id
      WHERE r.code = 'USER' AND u.id = $1
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
