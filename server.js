const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectMongoDB = require('./config/mongodb');

// Importar rutas
const transactionsRoutes = require('./routes/transactions');
const financesRoutes = require('./routes/finances');
const earningsRoutes = require('./routes/earnings');
const routesRoutes = require('./routes/routes');
const usersRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const reservationsRoutes = require('./routes/reservations');
const aiRoutes = require('./routes/ai');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conectar MongoDB
connectMongoDB();

// Rutas
app.use('/api/transactions', transactionsRoutes);
app.use('/api/finances', financesRoutes);
app.use('/api/earnings', earningsRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
