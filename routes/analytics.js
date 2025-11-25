// Rutas de análisis y retención
const express = require('express');
const router = express.Router();
const pool = require('../config/postgres');

// DEBUG: Ver qué datos hay de clientes
router.get('/debug/customers', async (req, res) => {
  try {
    // Primero ver la estructura de la tabla users
    const structureQuery = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    const structureResult = await pool.query(structureQuery);

    // Luego ver todos los usuarios
    const usersQuery = `
      SELECT *
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `;
    const usersResult = await pool.query(usersQuery);

    // Ver usuarios con transacciones
    const transactionsQuery = `
      SELECT 
        u.id,
        u.full_name,
        COUNT(wl.id) as transaction_count,
        MIN(DATE(wl.created_at)) as first_transaction,
        MAX(DATE(wl.created_at)) as last_transaction,
        STRING_AGG(DISTINCT wl.type, ', ') as transaction_types
      FROM users u
      LEFT JOIN wallet_ledger wl ON u.id = wl.user_id
      GROUP BY u.id, u.full_name
      HAVING COUNT(wl.id) > 0
      ORDER BY COUNT(wl.id) DESC
    `;
    const transactionsResult = await pool.query(transactionsQuery);

    res.json({
      table_structure: structureResult.rows,
      all_users: usersResult.rows,
      users_with_transactions: transactionsResult.rows
    });
  } catch (error) {
    console.error('Error:', error);
    res.json({ error: error.message });
  }
});

// Obtener usuarios activos diarios (que realizaron viajes)
router.get('/daily-active-users', async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE(wl.created_at) as date,
        COUNT(DISTINCT wl.user_id) as active_users,
        COUNT(*) as total_trips
      FROM wallet_ledger wl
      WHERE wl.type IN ('TOPUP', 'REFUND', 'RELEASE', 'TRIP_EARNINGS', 'WITHDRAW', 'HOLD', 'TRIP_PAYMENT')
      GROUP BY DATE(wl.created_at)
      ORDER BY date DESC
      LIMIT 30
    `;
    const result = await pool.query(query);
    res.json(result.rows || []);
  } catch (error) {
    console.error('Error:', error);
    res.json([]);
  }
});

// Obtener retención de usuarios (día 1, 7, 30)
router.get('/retention', async (req, res) => {
  try {
    const retentionQuery = `
      WITH user_first_date AS (
        SELECT 
          u.id,
          u.full_name,
          MIN(DATE(wl.created_at)) as first_date
        FROM users u
        JOIN wallet_ledger wl ON u.id = wl.user_id
        GROUP BY u.id, u.full_name
      ),
      user_retention AS (
        SELECT 
          ufd.id,
          ufd.full_name,
          ufd.first_date,
          COUNT(DISTINCT DATE(wl.created_at)) as total_active_days,
          MAX(CASE 
            WHEN DATE(wl.created_at) > ufd.first_date 
            AND DATE(wl.created_at) <= ufd.first_date + INTERVAL '1 day' 
            THEN 1 ELSE 0 
          END) as has_activity_day_1,
          MAX(CASE 
            WHEN DATE(wl.created_at) > ufd.first_date 
            AND DATE(wl.created_at) <= ufd.first_date + INTERVAL '7 days' 
            THEN 1 ELSE 0 
          END) as has_activity_day_7,
          MAX(CASE 
            WHEN DATE(wl.created_at) > ufd.first_date 
            AND DATE(wl.created_at) <= ufd.first_date + INTERVAL '30 days' 
            THEN 1 ELSE 0 
          END) as has_activity_day_30
        FROM user_first_date ufd
        LEFT JOIN wallet_ledger wl ON ufd.id = wl.user_id
        GROUP BY ufd.id, ufd.full_name, ufd.first_date
      )
      SELECT 
        COUNT(*) as total_users,
        ROUND(100.0 * SUM(has_activity_day_1)::numeric / NULLIF(COUNT(*), 0), 2) as retention_day_1,
        ROUND(100.0 * SUM(has_activity_day_7)::numeric / NULLIF(COUNT(*), 0), 2) as retention_day_7,
        ROUND(100.0 * SUM(has_activity_day_30)::numeric / NULLIF(COUNT(*), 0), 2) as retention_day_30
      FROM user_retention
    `;
    
    const result = await pool.query(retentionQuery);
    const data = result.rows[0] || {
      total_users: 0,
      retention_day_1: 0,
      retention_day_7: 0,
      retention_day_30: 0
    };

    res.json({
      total_users: parseInt(data.total_users) || 0,
      retention_day_1: parseFloat(data.retention_day_1) || 0,
      retention_day_7: parseFloat(data.retention_day_7) || 0,
      retention_day_30: parseFloat(data.retention_day_30) || 0
    });
  } catch (error) {
    console.error('Error:', error);
    res.json({
      total_users: 0,
      retention_day_1: 0,
      retention_day_7: 0,
      retention_day_30: 0
    });
  }
});

module.exports = router;
