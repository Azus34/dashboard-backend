// Rutas de ganancias (comisiones del 15% de reservas completadas)
const express = require('express');
const router = express.Router();
const pool = require('../config/postgres');

// Obtener ganancias totales (15% comisión de reservas completadas)
router.get('/total', async (req, res) => {
  try {
    const query = `
      SELECT 
        SUM(price) as total_amount,
        COUNT(*) as total_completed
      FROM reservations
      WHERE status = 'COMPLETED'
    `;
    const result = await pool.query(query);
    const row = result.rows[0];
    
    const totalAmount = parseFloat(row.total_amount || 0);
    const totalEarnings = totalAmount * 0.15; // 15% commission

    console.log(`Reservas completadas: ${row.total_completed}, Monto total: ${totalAmount}, Ganancias: ${totalEarnings}`);

    res.json({
      totalEarnings: totalEarnings,
      totalTrips: parseInt(row.total_completed || 0),
      commissionPercentage: 15,
    });
  } catch (error) {
    console.error('Error:', error);
    res.json({
      totalEarnings: 0,
      totalTrips: 0,
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
        SUM(price) as daily_total,
        COUNT(*) as trip_count
      FROM reservations
      WHERE status = 'COMPLETED'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) DESC
      LIMIT 30
    `;
    const result = await pool.query(query);
    
    // Calcular comisiones del 15%
    const earningsWithCommission = result.rows.map(row => ({
      date: row.date,
      earnings: parseFloat(row.daily_total || 0) * 0.15,
      trips: parseInt(row.trip_count || 0)
    }));

    res.json(earningsWithCommission);
  } catch (error) {
    console.error('Error:', error);
    res.json([]);
  }
});

// Obtener ganancias por conductor
router.get('/by-driver', async (req, res) => {
  try {
    const query = `
      SELECT 
        driver_id,
        SUM(price) as total_amount,
        COUNT(*) as trip_count
      FROM reservations
      WHERE status = 'COMPLETED'
      GROUP BY driver_id
      ORDER BY total_amount DESC
      LIMIT 50
    `;
    const result = await pool.query(query);
    
    const driverEarnings = result.rows.map(row => ({
      driverId: row.driver_id,
      driverName: row.driver_id, // Podrías hacer JOIN con users si tienes nombres
      totalCost: parseFloat(row.total_amount || 0),
      earnings: parseFloat(row.total_amount || 0) * 0.15,
      trips: parseInt(row.trip_count || 0)
    }));

    res.json(driverEarnings);
  } catch (error) {
    console.error('Error:', error);
    res.json([]);
  }
});

module.exports = router;
