// Rutas de ganancias (comisiones del 15%)
const express = require('express');
const router = express.Router();
const pool = require('../config/postgres');
const Route = require('../models/Route');

// Obtener ganancias totales (15% comisión)
router.get('/total', async (req, res) => {
  try {
    const query = `
      SELECT 
        SUM(amount_cents) as total_amount,
        COUNT(*) as total_transactions
      FROM wallet_ledger
    `;
    const result = await pool.query(query);
    const row = result.rows[0];
    
    const totalAmount = parseFloat(row.total_amount || 0);
    const totalEarnings = (totalAmount * 0.15) / 100; // 15% commission

    res.json({
      totalEarnings: totalEarnings,
      totalTransactions: parseInt(row.total_transactions || 0),
      commissionPercentage: 15,
    });
  } catch (error) {
    console.error('Error:', error);
    res.json({
      totalEarnings: 0,
      totalTransactions: 0,
      commissionPercentage: 15,
    });
  }
});

// Obtener ganancias por período (por día)
router.get('/by-period', async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE(created_at) as date,
        SUM(CASE WHEN type IN ('deposit', 'recharge', 'TOPUP', 'REFUND') THEN amount_cents ELSE 0 END) as daily_total,
        COUNT(*) as transaction_count
      FROM wallet_ledger
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) DESC
      LIMIT 30
    `;
    const result = await pool.query(query);
    
    // Calcular comisiones del 15%
    const earningsWithCommission = result.rows.map(row => ({
      date: row.date,
      earnings: (parseFloat(row.daily_total || 0) * 0.15) / 100, // Convertir de centavos
      transactions: parseInt(row.transaction_count || 0)
    }));

    res.json(earningsWithCommission);
  } catch (error) {
    console.error('Error:', error);
    res.json([]); // Return empty array on error
  }
});

// Obtener ganancias por conductor
router.get('/by-driver', async (req, res) => {
  try {
    const query = `
      SELECT 
        wl.user_id,
        u.full_name,
        SUM(wl.amount_cents) as total_amount,
        COUNT(*) as transaction_count
      FROM wallet_ledger wl
      LEFT JOIN users u ON wl.user_id = u.id
      GROUP BY wl.user_id, u.full_name
      ORDER BY total_amount DESC
      LIMIT 50
    `;
    const result = await pool.query(query);
    
    const driverEarnings = result.rows.map(row => ({
      userId: row.user_id,
      driverName: row.full_name || 'Unknown',
      totalAmount: parseFloat(row.total_amount || 0) / 100,
      earnings: (parseFloat(row.total_amount || 0) * 0.15) / 100,
      transactions: parseInt(row.transaction_count || 0)
    }));

    res.json(driverEarnings);
  } catch (error) {
    console.error('Error:', error);
    res.json([]);
  }
});

module.exports = router;
