// Rutas de viajes (routes)
const express = require('express');
const router = express.Router();
const Route = require('../models/Route');

// Obtener todos los viajes
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find({}).limit(100).catch(err => {
      console.error('MongoDB error:', err.message);
      return [];
    });
    res.json(routes || []);
  } catch (error) {
    console.error('Error:', error);
    res.json([]); // Return empty array instead of error
  }
});

// Obtener viaje por ID
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }
    res.json(route);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener viajes por conductor
router.get('/driver/:driverId', async (req, res) => {
  try {
    const routes = await Route.find({ driverId: req.params.driverId });
    res.json(routes);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener viajes activos/disponibles
router.get('/status/active', async (req, res) => {
  try {
    const routes = await Route.find({ status: { $in: ['available', 'in_progress'] } });
    res.json(routes);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
