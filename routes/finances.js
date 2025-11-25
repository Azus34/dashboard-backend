// Rutas de recargas y retiros
const express = require('express');
const router = express.Router();
const pool = require('../config/postgres');

// Obtener recargas de pasajeros
router.get('/recharges', async (req, res) => {
  try {
    const query = `
      SELECT wl.*, u.full_name, u.email, cp.phone_number
      FROM wallet_ledger wl
      JOIN users u ON wl.user_id = u.id
      LEFT JOIN customer_profiles cp ON u.id = cp.user_id
      WHERE wl.type IN ('TOPUP', 'REFUND', 'RELEASE', 'TRIP_EARNINGS')
      ORDER BY wl.created_at DESC
      LIMIT 100
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.json([]);
  }
});

// Obtener retiros de conductores
router.get('/withdrawals', async (req, res) => {
  try {
    const query = `
      SELECT wl.*, u.full_name, u.email, dp.phone_number, dp.license_number
      FROM wallet_ledger wl
      JOIN users u ON wl.user_id = u.id
      LEFT JOIN driver_profiles dp ON u.id = dp.user_id
      WHERE wl.type IN ('WITHDRAW', 'HOLD', 'TRIP_PAYMENT')
      ORDER BY wl.created_at DESC
      LIMIT 100
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.json([]);
  }
});

// Obtener estadísticas de recargas y retiros
router.get('/stats/summary', async (req, res) => {
  try {
    const query = `
      SELECT 
        COALESCE(SUM(CASE WHEN type IN ('TOPUP', 'REFUND', 'RELEASE', 'TRIP_EARNINGS') THEN amount_cents ELSE 0 END), 0) as total_recharges,
        COALESCE(SUM(CASE WHEN type IN ('WITHDRAW', 'HOLD', 'TRIP_PAYMENT') THEN ABS(amount_cents) ELSE 0 END), 0) as total_withdrawals,
        COALESCE(COUNT(CASE WHEN type IN ('TOPUP', 'REFUND', 'RELEASE', 'TRIP_EARNINGS') THEN 1 END), 0) as recharge_count,
        COALESCE(COUNT(CASE WHEN type IN ('WITHDRAW', 'HOLD', 'TRIP_PAYMENT') THEN 1 END), 0) as withdrawal_count
      FROM wallet_ledger
    `;
    const result = await pool.query(query);
    const data = result.rows[0] || {
      total_recharges: 0,
      total_withdrawals: 0,
      recharge_count: 0,
      withdrawal_count: 0
    };
    
    // Convertir a números enteros para evitar problemas de formato
    res.json({
      total_recharges: parseInt(data.total_recharges) || 0,
      total_withdrawals: parseInt(data.total_withdrawals) || 0,
      recharge_count: parseInt(data.recharge_count) || 0,
      withdrawal_count: parseInt(data.withdrawal_count) || 0
    });
  } catch (error) {
    console.error('Error:', error);
    res.json({
      total_recharges: 0,
      total_withdrawals: 0,
      recharge_count: 0,
      withdrawal_count: 0
    });
  }
});

module.exports = router;
